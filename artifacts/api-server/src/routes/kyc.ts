import { Router, type Request } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { kycTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getOrCreateUser } from "./users";
import { logger } from "../lib/logger";

const router = Router();

function getAuth(req: Request) {
  return (req as any).auth as { userId?: string } | undefined;
}

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

// GET /api/kyc
router.get("/kyc", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const kyc = await db.query.kycTable.findFirst({
      where: eq(kycTable.userId, user.id),
    });

    if (!kyc) { res.status(404).json({ error: "No KYC submission found" }); return; }
    res.json(formatKyc(kyc));
  } catch (err) {
    logger.error({ err }, "getKyc error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/kyc
router.post("/kyc", requireAuth(), async (req, res): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
    const user = await getOrCreateUser(auth.userId);

    const existing = await db.query.kycTable.findFirst({
      where: eq(kycTable.userId, user.id),
    });

    if (existing && existing.status === "approved") {
      res.status(400).json({ error: "Already approved" });
      return;
    }

    const { fullName, dateOfBirth, country, idDocumentUrl, selfieUrl } = req.body as {
      fullName: string; dateOfBirth: string; country: string;
      idDocumentUrl?: string; selfieUrl?: string;
    };

    let kyc: typeof kycTable.$inferSelect;
    if (existing) {
      const [updated] = await db.update(kycTable)
        .set({ fullName, dateOfBirth, country, idDocumentUrl, selfieUrl, status: "pending" })
        .where(eq(kycTable.id, existing.id))
        .returning();
      kyc = updated!;
    } else {
      const [newKyc] = await db.insert(kycTable).values({
        userId: user.id,
        status: "pending",
        fullName, dateOfBirth, country, idDocumentUrl, selfieUrl,
      }).returning();
      kyc = newKyc!;
    }

    await db.update(usersTable).set({ kycStatus: "pending" }).where(eq(usersTable.id, user.id));

    res.status(201).json(formatKyc(kyc));
  } catch (err) {
    logger.error({ err }, "submitKyc error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
