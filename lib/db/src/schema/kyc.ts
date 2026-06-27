import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kycTable = pgTable("kyc", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  fullName: text("full_name"),
  dateOfBirth: text("date_of_birth"),
  country: text("country"),
  idDocumentUrl: text("id_document_url"),
  selfieUrl: text("selfie_url"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertKycSchema = createInsertSchema(kycTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type Kyc = typeof kycTable.$inferSelect;
