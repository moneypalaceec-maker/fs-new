import { Router, type Request } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable, gameSessionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getOrCreateUser } from "./users";
import { logger } from "../lib/logger";
import { randomUUID } from "crypto";

const router = Router();

const HOUSE_EDGE = 0.02;

function getAuth(req: Request) {
  return (req as any).auth as { userId?: string } | undefined;
}

async function getWallet(userId: number, currency: string) {
  return db.query.walletsTable.findFirst({
    where: and(eq(walletsTable.userId, userId), eq(walletsTable.currency, currency)),
  });
}

async function deductWager(walletId: number, currentBalance: number, wager: number) {
  await db.update(walletsTable)
    .set({ balance: (currentBalance - wager).toFixed(8) })
    .where(eq(walletsTable.id, walletId));
}

async function addWinnings(walletId: number, currentBalance: number, payout: number) {
  await db.update(walletsTable)
    .set({ balance: (currentBalance + payout).toFixed(8) })
    .where(eq(walletsTable.id, walletId));
}

async function recordBet(userId: number, currency: string, wager: number, won: boolean, payout: number, gameType: string) {
  const [betTx] = await db.insert(transactionsTable).values({
    userId, type: "bet", currency, amount: wager.toFixed(8), status: "confirmed", gameType,
  }).returning();

  if (won && payout > 0) {
    await db.insert(transactionsTable).values({
      userId, type: "win", currency, amount: payout.toFixed(8), status: "confirmed", gameType,
    });
  } else if (!won) {
    await db.insert(transactionsTable).values({
      userId, type: "loss", currency, amount: wager.toFixed(8), status: "confirmed", gameType,
    });
  }

  return betTx!;
}

// POST /api/games/dice
router.post("/games/dice", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const { wager, currency, winChance, isOver } = req.body as {
      wager: string; currency: string; winChance: number; isOver: boolean;
    };

    const wagerAmt = parseFloat(wager);
    if (isNaN(wagerAmt) || wagerAmt <= 0) { res.status(400).json({ error: "Invalid wager" }); return; }
    if (winChance < 1 || winChance > 98) { res.status(400).json({ error: "Win chance must be 1-98%" }); return; }

    const wallet = await getWallet(user.id, currency);
    if (!wallet) { res.status(400).json({ error: "Wallet not found" }); return; }
    const balance = parseFloat(wallet.balance);
    if (balance < wagerAmt) { res.status(400).json({ error: "Insufficient balance" }); return; }

    const roll = Math.random() * 100;
    const won = isOver ? roll > (100 - winChance) : roll < winChance;
    const multiplier = (100 / winChance) * (1 - HOUSE_EDGE);
    const payout = won ? wagerAmt * multiplier : 0;

    await deductWager(wallet.id, balance, wagerAmt);
    if (won) await addWinnings(wallet.id, balance - wagerAmt, payout);

    const tx = await recordBet(user.id, currency, wagerAmt, won, payout, "dice");
    const newWallet = await getWallet(user.id, currency);

    res.json({
      roll: parseFloat(roll.toFixed(2)),
      winChance,
      isOver,
      won,
      payout: payout.toFixed(8),
      newBalance: newWallet?.balance ?? "0",
      transactionId: tx.id,
    });
  } catch (err) {
    logger.error({ err }, "playDice error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/games/coinflip
router.post("/games/coinflip", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const { wager, currency, choice } = req.body as {
      wager: string; currency: string; choice: "heads" | "tails";
    };

    const wagerAmt = parseFloat(wager);
    if (isNaN(wagerAmt) || wagerAmt <= 0) { res.status(400).json({ error: "Invalid wager" }); return; }

    const wallet = await getWallet(user.id, currency);
    if (!wallet) { res.status(400).json({ error: "Wallet not found" }); return; }
    const balance = parseFloat(wallet.balance);
    if (balance < wagerAmt) { res.status(400).json({ error: "Insufficient balance" }); return; }

    const outcome = Math.random() < 0.5 ? "heads" : "tails";
    const won = outcome === choice;
    const multiplier = 2 * (1 - HOUSE_EDGE);
    const payout = won ? wagerAmt * multiplier : 0;

    await deductWager(wallet.id, balance, wagerAmt);
    if (won) await addWinnings(wallet.id, balance - wagerAmt, payout);

    const tx = await recordBet(user.id, currency, wagerAmt, won, payout, "coinflip");
    const newWallet = await getWallet(user.id, currency);

    res.json({
      outcome,
      won,
      payout: payout.toFixed(8),
      newBalance: newWallet?.balance ?? "0",
      transactionId: tx.id,
    });
  } catch (err) {
    logger.error({ err }, "playCoinflip error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Card game helpers
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

function createDeck(): string[] {
  const deck: string[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push(`${rank}${suit}`);
  return deck.sort(() => Math.random() - 0.5);
}

function cardValue(card: string): number {
  const rank = card.slice(0, -1);
  if (["J","Q","K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return parseInt(rank);
}

function handScore(cards: string[]): number {
  let score = cards.reduce((s, c) => s + cardValue(c), 0);
  let aces = cards.filter(c => c.includes("A")).length;
  while (score > 21 && aces > 0) { score -= 10; aces--; }
  return score;
}

// POST /api/games/blackjack/start
router.post("/games/blackjack/start", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const { wager, currency } = req.body as { wager: string; currency: string };
    const wagerAmt = parseFloat(wager);
    if (isNaN(wagerAmt) || wagerAmt <= 0) { res.status(400).json({ error: "Invalid wager" }); return; }

    const wallet = await getWallet(user.id, currency);
    if (!wallet) { res.status(400).json({ error: "Wallet not found" }); return; }
    const balance = parseFloat(wallet.balance);
    if (balance < wagerAmt) { res.status(400).json({ error: "Insufficient balance" }); return; }

    await deductWager(wallet.id, balance, wagerAmt);

    const deck = createDeck();
    const playerCards = [deck[0]!, deck[2]!];
    const dealerCards = [deck[1]!, deck[3]!];
    const playerScore = handScore(playerCards);
    const dealerScore = handScore(dealerCards);
    const sessionId = randomUUID();

    let status = "playing";
    let payout: number | null = null;
    let transactionId: number | null = null;

    if (playerScore === 21) {
      status = "blackjack";
      payout = wagerAmt * 2.5;
      await addWinnings(wallet.id, balance - wagerAmt, payout);
      const tx = await recordBet(user.id, currency, wagerAmt, true, payout, "blackjack");
      transactionId = tx.id;
    }

    const gameData = JSON.stringify({ deck: deck.slice(4), playerCards, dealerCards });

    await db.insert(gameSessionsTable).values({
      sessionId,
      userId: user.id,
      gameType: "blackjack",
      wager,
      currency,
      status: status === "playing" ? "active" : "finished",
      won: status === "blackjack" ? true : null,
      payout: payout !== null ? payout.toFixed(8) : null,
      gameData,
    });

    res.json({
      sessionId,
      playerCards,
      dealerCards: status === "playing" ? [dealerCards[0]!, "??"] : dealerCards,
      playerScore,
      dealerScore: status === "playing" ? cardValue(dealerCards[0]!) : dealerScore,
      status,
      wager,
      currency,
      payout: payout !== null ? payout.toFixed(8) : null,
      transactionId,
    });
  } catch (err) {
    logger.error({ err }, "startBlackjack error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/games/blackjack/:sessionId/action
router.post("/games/blackjack/:sessionId/action", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const sessionId = String(req.params["sessionId"] ?? "");
    const { action } = req.body as { action: "hit" | "stand" | "double" };

    const session = await db.query.gameSessionsTable.findFirst({
      where: and(
        eq(gameSessionsTable.sessionId, sessionId),
        eq(gameSessionsTable.userId, user.id),
      ),
    });

    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    if (session.status !== "active") { res.status(400).json({ error: "Session not active" }); return; }

    const gameData = JSON.parse(session.gameData ?? "{}") as {
      deck: string[]; playerCards: string[]; dealerCards: string[];
    };
    const { deck, playerCards, dealerCards } = gameData;
    const wagerAmt = parseFloat(session.wager);
    const currency = session.currency;

    const wallet = await getWallet(user.id, currency);
    if (!wallet) { res.status(400).json({ error: "Wallet not found" }); return; }
    const balance = parseFloat(wallet.balance);

    if (action === "hit") {
      playerCards.push(deck.shift()!);
    } else if (action === "double") {
      if (balance < wagerAmt) { res.status(400).json({ error: "Insufficient balance for double" }); return; }
      await deductWager(wallet.id, balance, wagerAmt);
      playerCards.push(deck.shift()!);
    }

    let playerScore = handScore(playerCards);
    let status = "playing";
    let payout: number | null = null;
    const totalWager = action === "double" ? wagerAmt * 2 : wagerAmt;
    let transactionId: number | null = null;

    if (playerScore > 21) {
      status = "player_bust";
    } else if (action === "stand" || action === "double") {
      let dealerScore = handScore(dealerCards);
      while (dealerScore < 17) {
        dealerCards.push(deck.shift()!);
        dealerScore = handScore(dealerCards);
      }
      playerScore = handScore(playerCards);

      if (dealerScore > 21) {
        status = "dealer_bust";
        payout = totalWager * 2;
      } else if (playerScore > dealerScore) {
        status = "player_win";
        payout = totalWager * 2;
      } else if (dealerScore > playerScore) {
        status = "dealer_win";
      } else {
        status = "push";
        payout = totalWager;
      }
    }

    if (status !== "playing") {
      const won = ["player_win","dealer_bust"].includes(status);
      const push = status === "push";
      const extraBalance = action === "double" ? balance - wagerAmt : balance;

      if ((won || push) && payout) {
        await addWinnings(wallet.id, extraBalance, payout);
      }
      const tx = await recordBet(user.id, currency, totalWager, won, won ? (payout ?? 0) : 0, "blackjack");
      transactionId = tx.id;

      await db.update(gameSessionsTable)
        .set({
          status: "finished",
          won,
          payout: payout?.toFixed(8) ?? "0",
          gameData: JSON.stringify({ deck, playerCards, dealerCards }),
        })
        .where(eq(gameSessionsTable.id, session.id));
    } else {
      await db.update(gameSessionsTable)
        .set({ gameData: JSON.stringify({ deck, playerCards, dealerCards }) })
        .where(eq(gameSessionsTable.id, session.id));
    }

    const finalDealerScore = handScore(dealerCards);

    res.json({
      sessionId,
      playerCards,
      dealerCards: status === "playing" ? [dealerCards[0]!, "??"] : dealerCards,
      playerScore,
      dealerScore: status === "playing" ? cardValue(dealerCards[0]!) : finalDealerScore,
      status,
      wager: session.wager,
      currency,
      payout: payout !== null ? payout.toFixed(8) : null,
      transactionId,
    });
  } catch (err) {
    logger.error({ err }, "blackjackAction error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/games/slots
router.post("/games/slots", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const { wager, currency } = req.body as { wager: string; currency: string };
    const wagerAmt = parseFloat(wager);
    if (isNaN(wagerAmt) || wagerAmt <= 0) { res.status(400).json({ error: "Invalid wager" }); return; }

    const wallet = await getWallet(user.id, currency);
    if (!wallet) { res.status(400).json({ error: "Wallet not found" }); return; }
    const balance = parseFloat(wallet.balance);
    if (balance < wagerAmt) { res.status(400).json({ error: "Insufficient balance" }); return; }

    const SYMBOLS = ["7", "cherry", "lemon", "diamond", "star", "bell"];
    const WEIGHTS  = [1,    3,        4,       2,         3,      3    ];
    const MULTIPLIERS: Record<string, number> = {
      "7-7-7": 100,
      "diamond-diamond-diamond": 20,
      "star-star-star": 10,
      "bell-bell-bell": 8,
      "cherry-cherry-cherry": 5,
      "lemon-lemon-lemon": 3,
    };

    function weightedRandom(): string {
      const total = WEIGHTS.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < SYMBOLS.length; i++) {
        r -= WEIGHTS[i]!;
        if (r <= 0) return SYMBOLS[i]!;
      }
      return SYMBOLS[SYMBOLS.length - 1]!;
    }

    const reels = [weightedRandom(), weightedRandom(), weightedRandom()];
    const key = reels.join("-");
    const multiplier = MULTIPLIERS[key] ?? 0;
    const won = multiplier > 0;
    const payout = won ? wagerAmt * multiplier * (1 - HOUSE_EDGE) : 0;

    await deductWager(wallet.id, balance, wagerAmt);
    if (won) await addWinnings(wallet.id, balance - wagerAmt, payout);

    const tx = await recordBet(user.id, currency, wagerAmt, won, payout, "slots");
    const newWallet = await getWallet(user.id, currency);

    res.json({
      reels,
      won,
      multiplier,
      payout: payout.toFixed(8),
      newBalance: newWallet?.balance ?? "0",
      transactionId: tx.id,
    });
  } catch (err) {
    logger.error({ err }, "playSlots error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/games/history
router.get("/games/history", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const { game, limit = "20" } = req.query as { game?: string; limit?: string };
    const limitNum = parseInt(limit ?? "20") || 20;

    const sessions = await db.select()
      .from(gameSessionsTable)
      .where(eq(gameSessionsTable.userId, user.id))
      .orderBy(desc(gameSessionsTable.createdAt))
      .limit(limitNum * 3);

    const filtered = sessions
      .filter(s => (!game || s.gameType === game) && s.status === "finished")
      .slice(0, limitNum);

    res.json(filtered.map(s => ({
      id: s.id,
      gameType: s.gameType,
      wager: s.wager,
      currency: s.currency,
      won: s.won ?? false,
      payout: s.payout ?? "0",
      createdAt: s.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "getGameHistory error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
