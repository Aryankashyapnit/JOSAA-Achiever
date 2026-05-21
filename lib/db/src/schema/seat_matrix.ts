import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const seatMatrixTable = pgTable("seat_matrix", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").notNull(),
  branch: text("branch").notNull(),
  category: text("category").notNull(),
  gender: text("gender").notNull(),
  totalSeats: integer("total_seats").notNull(),
  year: integer("year").notNull(),
});

export const insertSeatMatrixSchema = createInsertSchema(seatMatrixTable).omit({ id: true });
export type InsertSeatMatrix = z.infer<typeof insertSeatMatrixSchema>;
export type SeatMatrix = typeof seatMatrixTable.$inferSelect;
