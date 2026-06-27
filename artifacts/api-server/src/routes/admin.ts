import { Router, type Request, type Response } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  usersTable,
  transactionsTable,
  kycTable,
  gameSessionsTable,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { getOrCreateUser } from "./users";
import { logger } from "../lib/logger";

const router = Router();

function getAuth(req: Request) {
  return (req as any).auth as { userId?: string } | undefined;
}

async function requireAdmin(req: Request, res: Response) {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return null; }
  const user = await getOrCreateUser(auth.userId);
  if (!user.isAdmin) { res.status(403).json({ error: "Forbidden" }); return null; }
  return user;
}

const formatUser = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  clerkId: u.clerkId,
  username: u.username,
  email: u.email,
  createdAt: u.createdAt.toISOString(),
  kycStatus: u.kycStatus,
  isAdmin: u.isAdmin,
  isBanned: u.isBanned,
  totalWagers: "0",
  totalDeposits: "0",
});

const formatKyc = (k: typeof kycTable.$inferSelect) => ({
  id: k.id,
  userId: k.userId,
  status: k.status,
  fullName: k.fullName,
  dateOfBirth: k.dateOfBirth,
  country: k.country,
  rejectionReason: k.rejectionReason,
  createdAt: k.createdAt.toISOString(),
  updatedAt: k.updatedAt.toISOString(),
});

// GET /api/admin/stats
router.get("/admin/stats", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;

    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    const txs = await db.select().from(transactionsTable);
    const [pendingKycCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(kycTable).where(eq(kycTable.status, "pending"));
    const [pendingWithdrawals] = await db.select({ count: sql<number>`count(*)::int` })
      .from(transactionsTable)
      .where(eq(transactionsTable.type, "withdrawal"));

    let totalDeposits = 0, totalWithdrawals = 0, totalWagers = 0, totalPaidOut = 0;
    for (const tx of txs) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === "deposit") totalDeposits += amt;
      else if (tx.type === "withdrawal") totalWithdrawals += amt;
      else if (tx.type === "bet") totalWagers += amt;
      else if (tx.type === "win") totalPaidOut += amt;
    }

    const houseEdgeVal = totalWagers > 0
      ? ((totalWagers - totalPaidOut) / totalWagers * 100).toFixed(2)
      : "0";

    res.json({
      totalUsers: userCount?.count ?? 0,
      totalDeposits: totalDeposits.toFixed(4),
      totalWithdrawals: totalWithdrawals.toFixed(4),
      totalWagers: totalWagers.toFixed(4),
      houseEdge: `${houseEdgeVal}%`,
      activeToday: 0,
      pendingKyc: pendingKycCount?.count ?? 0,
      pendingWithdrawals: pendingWithdrawals?.count ?? 0,
    });
  } catch (err) {
    logger.error({ err }, "getAdminStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users
router.get("/admin/users", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;

    const { page = "1", limit = "20", search } = req.query as Record<string, string>;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const allUsers = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    const filtered = search
      ? allUsers.filter(u =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()))
      : allUsers;

    res.json({
      items: filtered.slice(offset, offset + limitNum).map(formatUser),
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    logger.error({ err }, "listAdminUsers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users/:id
router.get("/admin/users/:id", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;
    const id = parseInt(String(req.params["id"]) || "0");
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, id) });
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    logger.error({ err }, "getAdminUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:id
router.patch("/admin/users/:id", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;
    const id = parseInt(String(req.params["id"]) || "0");
    const { isAdmin, isBanned } = req.body as { isAdmin?: boolean; isBanned?: boolean };
    const [updated] = await db.update(usersTable)
      .set({ ...(isAdmin !== undefined && { isAdmin }), ...(isBanned !== undefined && { isBanned }) })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(updated));
  } catch (err) {
    logger.error({ err }, "updateAdminUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/kyc
router.get("/admin/kyc", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;
    const { status, page = "1" } = req.query as Record<string, string>;
    const pageNum = parseInt(page) || 1;
    const limit = 20;
    const offset = (pageNum - 1) * limit;

    const all = await db.select().from(kycTable).orderBy(desc(kycTable.createdAt));
    const filtered = status ? all.filter(k => k.status === status) : all;

    res.json({
      items: filtered.slice(offset, offset + limit).map(formatKyc),
      total: filtered.length,
      page: pageNum,
      limit,
    });
  } catch (err) {
    logger.error({ err }, "listAdminKyc error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/kyc/:id
router.patch("/admin/kyc/:id", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;
    const id = parseInt(String(req.params["id"]) || "0");
    const { status, rejectionReason } = req.body as {
      status: "approved" | "rejected"; rejectionReason?: string;
    };

    const [updated] = await db.update(kycTable)
      .set({ status, ...(rejectionReason && { rejectionReason }) })
      .where(eq(kycTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }

    await db.update(usersTable)
      .set({ kycStatus: status })
      .where(eq(usersTable.id, updated.userId));

    res.json(formatKyc(updated));
  } catch (err) {
    logger.error({ err }, "reviewKyc error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/transactions
router.get("/admin/transactions", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;
    const { type, page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    const all = await db.select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.createdAt));
    const filtered = type ? all.filter(t => t.type === type) : all;

    res.json({
      items: filtered.slice(offset, offset + limitNum).map(tx => ({
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
      })),
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    logger.error({ err }, "listAdminTransactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/game-analytics
router.get("/admin/game-analytics", requireAuth(), async (req, res): Promise<void> => {
  try {
    if (!await requireAdmin(req, res)) return;

    const sessions = await db.select()
      .from(gameSessionsTable)
      .where(eq(gameSessionsTable.status, "finished"));
    const bets = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.type, "bet"));
    const wins = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.type, "win"));

    const gameTypes = ["dice", "coinflip", "blackjack", "slots"];
    const byGame = gameTypes.map(gameType => {
      const gameBets = bets.filter(t => t.gameType === gameType);
      const gameWins = wins.filter(t => t.gameType === gameType);
      const gameSessions = sessions.filter(s => s.gameType === gameType);

      const totalWagered = gameBets.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const totalPaidOut = gameWins.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const winCount = gameSessions.filter(s => s.won).length;
      const winRate = gameSessions.length > 0 ? winCount / gameSessions.length : 0;

      return {
        gameType,
        totalBets: gameBets.length,
        totalWagered: totalWagered.toFixed(6),
        totalPaidOut: totalPaidOut.toFixed(6),
        houseProfit: (totalWagered - totalPaidOut).toFixed(6),
        winRate,
      };
    });

    res.json({ byGame });
  } catch (err) {
    logger.error({ err }, "getGameAnalytics error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
