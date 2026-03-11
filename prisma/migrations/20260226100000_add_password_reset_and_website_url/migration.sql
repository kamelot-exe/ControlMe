-- AlterTable: Add password reset token fields to users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_reset_token"        TEXT,
  ADD COLUMN IF NOT EXISTS "password_reset_token_expiry" TIMESTAMP(3);

-- AlterTable: Add website_url to subscriptions
ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "website_url" TEXT;

-- CreateIndex: unique constraint on password reset token
CREATE UNIQUE INDEX IF NOT EXISTS "users_password_reset_token_key" ON "users"("password_reset_token");
