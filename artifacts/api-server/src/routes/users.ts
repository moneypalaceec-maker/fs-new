import { Router, type Request } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  usersTable,
  transactionsTable,
  walletsTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const DEPOSIT_ADDRESSES: Record<string, { address: string; network: string }> = {
  ETH: { address: "0x7fA636B8E805D3EA4765c2fe79C4D43cA08D5d8b", network: "Ethereum" },
  BTC: { address: "bc1qjzlpuqxh6lvwxux65uqpzue5nh2yllym5xprey", network: "Bitcoin" },
  SOL: { address: "AK1W2vSHMsZhLLnztqskAHzNhu3EHKoxYkuTui2yr9fX", network: "Solana" },
  USDC: { address: "AK1W2vSHMsZhLLnztqskAHzNhu3EHKoxYkuTui2yr9fX", network: "Solana" },
};

export async function getOrCreateUser(clerkId: string, email?: string, username?: string) {
  let user = await db.query.usersTable.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });
  if (!user) {
    const [newUser] = await db.insert(usersTable).values({
      clerkId,
      email: email ?? `${clerkId}@placeholder.com`,
      username: username ?? `user_${clerkId.slice(-6)}`,
    }).returning();
    user = newUser!;
    for (const [currency, info] of Object.entries(DEPOSIT_ADDRESSES)) {
      await db.insert(walletsTable).values({
        userId: user.id,
        currency,
        balance: "0",
        depositAddress: info.address,
        network: info.network,
      });
    }
  }
  return user;
}

function getAuth(req: Request) {
  return (req as any).auth as { userId?: string } | undefined;
}

// GET /api/users/me
router.get("/users/me", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);
    res.json({
      id: user.id,
      clerkId: user.clerkId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isAdmin: user.isAdmin,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "getMe error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/me
router.patch("/users/me", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);
    const { username, avatarUrl } = req.body as { username?: string; avatarUrl?: string };
    const [updated] = await db.update(usersTable)
      .set({ ...(username && { username }), ...(avatarUrl !== undefined && { avatarUrl }) })
      .where(eq(usersTable.id, user.id))
      .returning();
    res.json({
      id: updated!.id,
      clerkId: updated!.clerkId,
      username: updated!.username,
      email: updated!.email,
      avatarUrl: updated!.avatarUrl,
      isAdmin: updated!.isAdmin,
      kycStatus: updated!.kycStatus,
      createdAt: updated!.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "updateMe error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me/stats
router.get("/users/me/stats", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, user.id));
    let totalDeposits = 0, totalWithdrawals = 0, totalWagers = 0, totalWins = 0, totalLosses = 0;
    let gamesPlayed = 0, wins = 0;

    for (const tx of txs) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === "deposit") totalDeposits += amt;
      else if (tx.type === "withdrawal") totalWithdrawals += amt;
      else if (tx.type === "bet") { totalWagers += amt; gamesPlayed++; }
      else if (tx.type === "win") { totalWins += amt; wins++; }
      else if (tx.type === "loss") totalLosses += amt;
    }

    const winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0;
    const netProfit = totalWins - totalWagers;

    res.json({
      totalDeposits: totalDeposits.toFixed(6),
      totalWithdrawals: totalWithdrawals.toFixed(6),
      totalWagers: totalWagers.toFixed(6),
      totalWins: totalWins.toFixed(6),
      totalLosses: totalLosses.toFixed(6),
      netProfit: netProfit.toFixed(6),
      gamesPlayed,
      winRate,
    });
  } catch (err) {
    logger.error({ err }, "getMyStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me/activity
router.get("/users/me/activity", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);
    const limitQ = req.query["limit"];
    const limit = limitQ ? parseInt(String(limitQ)) : 20;

    const txs = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, user.id))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(limit);

    res.json(txs.map(tx => ({
      id: tx.id,
      type: tx.type,
      description: tx.gameType
        ? `${tx.gameType} ${tx.type}`
        : `${tx.type} ${tx.currency}`,
      amount: tx.amount,
      currency: tx.currency,
      createdAt: tx.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "getMyActivity error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
