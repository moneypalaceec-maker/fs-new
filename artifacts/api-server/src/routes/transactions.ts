import { Router, type Request } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getOrCreateUser } from "./users";
import { logger } from "../lib/logger";

const router = Router();

function getAuth(req: Request) {
  return (req as any).auth as { userId?: string } | undefined;
}

const formatTx = (tx: typeof transactionsTable.$inferSelect) => ({
  id: tx.id,
  userId: tx.userId,
  type: tx.type,
  currency: tx.currency,
  amount: tx.amount,
  status: tx.status,
  txHash: tx.txHash,
  toAddress: tx.toAddress,
  gameType: tx.gameType,
  createdAt: tx.createdAt.toISOString(),
});

// GET /api/transactions
router.get("/transactions", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const { type, currency, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const allTxs = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, user.id))
      .orderBy(desc(transactionsTable.createdAt));

    const filtered = allTxs.filter(tx => {
      if (type && tx.type !== type) return false;
      if (currency && tx.currency !== currency) return false;
      return true;
    });

    const items = filtered.slice(offset, offset + limitNum);

    res.json({
      items: items.map(formatTx),
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    logger.error({ err }, "listTransactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/transactions/:id
router.get("/transactions/:id", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const id = parseInt(String(req.params["id"]) || "0");
    const tx = await db.query.transactionsTable.findFirst({
      where: eq(transactionsTable.id, id),
    });

    if (!tx || tx.userId !== user.id) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatTx(tx));
  } catch (err) {
    logger.error({ err }, "getTransaction error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
