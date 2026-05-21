import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cutoffsTable = pgTable("cutoffs", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").notNull(),
  branch: text("branch").notNull(),
  category: text("category").notNull(),
  gender: text("gender").notNull(),
  year: integer("year").notNull(),
  round: integer("round").notNull(),
  openingRank: integer("opening_rank").notNull(),
  closingRank: integer("closing_rank").notNull(),
});

export const insertCutoffSchema = createInsertSchema(cutoffsTable).omit({ id: true });
export type InsertCutoff = z.infer<typeof insertCutoffSchema>;
export type Cutoff = typeof cutoffsTable.$inferSelect;
