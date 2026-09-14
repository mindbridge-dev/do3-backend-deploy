import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  int,
  timestamp,
  bigint,
} from "drizzle-orm/mysql-core";

// ── vouchers ─────────────────────────────────────────────────────────────
// dynamic, single-use voucher codes generated from the pricing ladder.
// each voucher carries the comparison baseline it was issued against so the
// "compare prices" story travels with the code.
export const vouchers = mysqlTable("vouchers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  tier: varchar("tier", { length: 40 }).notNull(), // focus | overnight | sprint | metro | hospital
  discountPct: int("discount_pct").notNull(),
  baselineLabel: varchar("baseline_label", { length: 120 }).notNull(), // e.g. "hotel night near the airport"
  baselinePrice: int("baseline_price").notNull(), // QAR
  do3Price: int("do3_price").notNull(), // QAR after discount
  // ── purchaser / recipient (payment is manual until online checkout ships)
  email: varchar("email", { length: 320 }), // purchaser email
  buyerName: varchar("buyer_name", { length: 120 }),
  buyerPhone: varchar("buyer_phone", { length: 40 }),
  buyerType: mysqlEnum("buyer_type", ["self", "gift", "institution"]).notNull().default("self"),
  orgName: varchar("org_name", { length: 160 }), // institution only
  recipientName: varchar("recipient_name", { length: 120 }),
  recipientEmail: varchar("recipient_email", { length: 320 }),
  lang: varchar("lang", { length: 2 }).notNull().default("en"),
  // ── lifecycle: pending_payment → active → redeemed | expired
  status: mysqlEnum("status", ["pending_payment", "active", "redeemed", "expired"])
    .notNull()
    .default("pending_payment"),
  paidVia: varchar("paid_via", { length: 20 }), // onsite | link
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at").notNull(),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = typeof vouchers.$inferInsert;

// ── bookings ─────────────────────────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: serial("id").primaryKey(),
  ref: varchar("ref", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  tier: varchar("tier", { length: 40 }).notNull(),
  location: varchar("location", { length: 40 }).notNull().default("flagship"),
  startDate: varchar("start_date", { length: 10 }).notNull(), // YYYY-MM-DD
  startTime: varchar("start_time", { length: 5 }), // HH:MM for hourly tiers
  units: int("units").notNull(), // hours or nights depending on tier
  unitPrice: int("unit_price").notNull(), // QAR before discount
  discountPct: int("discount_pct").notNull().default(0),
  total: int("total").notNull(), // QAR after discount
  voucherId: bigint("voucher_id", { mode: "number", unsigned: true }),
  notes: text("notes"),
  status: mysqlEnum("status", ["confirmed", "waitlist"]).notNull().default("confirmed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ── waitlist ─────────────────────────────────────────────────────────────
export const waitlist = mysqlTable("waitlist", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  segment: mysqlEnum("segment", ["b2c", "b2b"]).notNull().default("b2c"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type WaitlistEntry = typeof waitlist.$inferSelect;

// ── b2b inquiries ────────────────────────────────────────────────────────
export const b2bInquiries = mysqlTable("b2b_inquiries", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  interest: mysqlEnum("interest", [
    "placement", // do³ flex equipment rental (fire station model)
    "corporate-block", // guaranteed room-nights at blended rate
    "licensing", // do³ flex design IP
    "franchise", // regional franchise
  ]).notNull(),
  pods: int("pods"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type B2bInquiry = typeof b2bInquiries.$inferSelect;
