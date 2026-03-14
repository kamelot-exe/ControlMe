ALTER TABLE "notification_settings"
  ADD COLUMN IF NOT EXISTS "renewal_emails_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "unused_emails_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "weekly_digest_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "monthly_digest_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "weekly_digest_day" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "monthly_digest_day" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "digest_time" TEXT,
  ADD COLUMN IF NOT EXISTS "time_zone" TEXT DEFAULT 'UTC';

CREATE TABLE IF NOT EXISTS "notification_delivery" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "subscription_id" TEXT,
  "type" TEXT NOT NULL,
  "dedupe_key" TEXT NOT NULL,
  "scheduled_for" TIMESTAMP(3),
  "sent_at" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "last_attempt_at" TIMESTAMP(3),
  "last_error" TEXT,
  "payload" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_delivery_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_delivery_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "notification_delivery_subscription_id_fkey"
    FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_delivery_dedupe_key_key"
  ON "notification_delivery"("dedupe_key");

CREATE INDEX IF NOT EXISTS "notification_delivery_user_type_idx"
  ON "notification_delivery"("user_id", "type");

CREATE INDEX IF NOT EXISTS "notification_delivery_subscription_idx"
  ON "notification_delivery"("subscription_id");

ALTER TABLE "notification_delivery"
  ADD COLUMN IF NOT EXISTS "attempt_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "last_attempt_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "last_error" TEXT;
