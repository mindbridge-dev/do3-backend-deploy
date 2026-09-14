-- do³ — dodo & do · database schema (v2: voucher lifecycle)
-- run once in the TiDB Cloud SQL Editor (cluster "Booking").
-- safe to re-run: CREATE TABLE IF NOT EXISTS + guarded ALTERs.

USE `1a09733f-fe62-8e74-8000-0970d14f19d5`;

CREATE TABLE IF NOT EXISTS vouchers (
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code varchar(20) NOT NULL UNIQUE,
  tier varchar(40) NOT NULL,
  discount_pct int NOT NULL,
  baseline_label varchar(120) NOT NULL,
  baseline_price int NOT NULL,
  do3_price int NOT NULL,
  email varchar(320),
  buyer_name varchar(120),
  buyer_phone varchar(40),
  buyer_type enum('self','gift','institution') NOT NULL DEFAULT 'self',
  org_name varchar(160),
  recipient_name varchar(120),
  recipient_email varchar(320),
  lang varchar(2) NOT NULL DEFAULT 'en',
  status enum('pending_payment','active','redeemed','expired') NOT NULL DEFAULT 'pending_payment',
  paid_via varchar(20),
  activated_at timestamp NULL,
  expires_at timestamp NOT NULL,
  redeemed_at timestamp NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- if the vouchers table already exists from v1, upgrade it in place:
ALTER TABLE vouchers MODIFY COLUMN status enum('pending_payment','active','redeemed','expired') NOT NULL DEFAULT 'pending_payment';
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS buyer_name varchar(120) NULL AFTER email;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS buyer_phone varchar(40) NULL AFTER buyer_name;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS buyer_type enum('self','gift','institution') NOT NULL DEFAULT 'self' AFTER buyer_phone;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS org_name varchar(160) NULL AFTER buyer_type;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS recipient_name varchar(120) NULL AFTER org_name;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS recipient_email varchar(320) NULL AFTER recipient_name;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS lang varchar(2) NOT NULL DEFAULT 'en' AFTER recipient_email;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS paid_via varchar(20) NULL AFTER status;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS activated_at timestamp NULL AFTER paid_via;

CREATE TABLE IF NOT EXISTS bookings (
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ref varchar(20) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  email varchar(320) NOT NULL,
  phone varchar(40),
  tier varchar(40) NOT NULL,
  location varchar(40) NOT NULL DEFAULT 'flagship',
  start_date varchar(10) NOT NULL,
  start_time varchar(5),
  units int NOT NULL,
  unit_price int NOT NULL,
  discount_pct int NOT NULL DEFAULT 0,
  total int NOT NULL,
  voucher_id bigint unsigned,
  notes text,
  status enum('confirmed','waitlist') NOT NULL DEFAULT 'confirmed',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waitlist (
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name varchar(120) NOT NULL,
  email varchar(320) NOT NULL,
  segment enum('b2c','b2b') NOT NULL DEFAULT 'b2c',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2b_inquiries (
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  company varchar(160) NOT NULL,
  contact varchar(120) NOT NULL,
  email varchar(320) NOT NULL,
  interest enum('placement','corporate-block','licensing','franchise') NOT NULL,
  pods int,
  message text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
