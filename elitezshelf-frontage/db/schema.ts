// Drizzle schema sketch — wire up before launch.
// Requires: pnpm add drizzle-orm postgres @supabase/supabase-js
//           pnpm add -D drizzle-kit

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  fullName: text("full_name").notNull(),
  workEmail: text("work_email").notNull(),
  company: text("company").notNull(),
  role: text("role"),
  country: text("country").notNull(),
  categories: text("categories").array(),
  retailers: text("retailers").array(),
  comments: text("comments"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
