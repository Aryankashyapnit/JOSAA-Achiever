import { pgTable, text, serial, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const counsellingRoundsTable = pgTable("counselling_rounds", {
  id: serial("id").primaryKey(),
  roundNumber: integer("round_number").notNull(),
  year: integer("year").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, active, completed
});

export const insertCounsellingRoundSchema = createInsertSchema(counsellingRoundsTable).omit({ id: true });
export type InsertCounsellingRound = z.infer<typeof insertCounsellingRoundSchema>;
export type CounsellingRound = typeof counsellingRoundsTable.$inferSelect;
