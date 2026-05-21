import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collegesTable = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  type: text("type").notNull(), // IIT, NIT, IIIT, GFTI
  state: text("state").notNull(),
  city: text("city").notNull(),
  nirf: integer("nirf"),
  established: integer("established"),
  totalSeats: integer("total_seats"),
  website: text("website"),
  description: text("description"),
});

export const insertCollegeSchema = createInsertSchema(collegesTable).omit({ id: true });
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type College = typeof collegesTable.$inferSelect;
