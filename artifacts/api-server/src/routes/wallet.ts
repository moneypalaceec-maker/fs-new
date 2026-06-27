import { Router, type Request } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getOrCreateUser } from "./users";
import { logger } from "../lib/logger";

const router = Router();

function getAuth(req: Request) {
  return (req as any).auth as { userId?: string } | undefined;
}

// GET /api/wallet
router.get("/wallet", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const wallets = await db.select()
      .from(walletsTable)
      .where(eq(walletsTable.userId, user.id));

    res.json({
      balances: wallets.map(w => ({
        currency: w.currency,
        balance: w.balance,
        depositAddress: w.depositAddress,
        network: w.network,
      })),
    });
  } catch (err) {
    logger.error({ err }, "getWallet error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/wallet/withdraw
router.post("/wallet/withdraw", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    if (user.kycStatus !== "approved") {
      res.status(400).json({ error: "KYC verification required before withdrawals" });
      return;
    }

    const { currency, amount, toAddress } = req.body as {
      currency: string; amount: string; toAddress: string;
    };

    const wallet = await db.query.walletsTable.findFirst({
      where: and(eq(walletsTable.userId, user.id), eq(walletsTable.currency, currency)),
    });

    if (!wallet) { res.status(400).json({ error: "Wallet not found" }); return; }

    const currentBalance = parseFloat(wallet.balance) || 0;
    const withdrawalAmt = parseFloat(amount) || 0;

    if (withdrawalAmt <= 0) { res.status(400).json({ error: "Invalid amount" }); return; }
    if (currentBalance < withdrawalAmt) { res.status(400).json({ error: "Insufficient balance" }); return; }

    await db.update(walletsTable)
      .set({ balance: (currentBalance - withdrawalAmt).toFixed(8) })
      .where(eq(walletsTable.id, wallet.id));

    const [tx] = await db.insert(transactionsTable).values({
      userId: user.id,
      type: "withdrawal",
      currency,
      amount,
      status: "pending",
      toAddress,
    }).returning();

    res.status(201).json({
      id: tx!.id,
      userId: tx!.userId,
      type: tx!.type,
      currency: tx!.currency,
      amount: tx!.amount,
      status: tx!.status,
      txHash: tx!.txHash,
      toAddress: tx!.toAddress,
      gameType: tx!.gameType,
      createdAt: tx!.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "requestWithdrawal error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
