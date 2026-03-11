-- AlterTable (fixed: table is "users", column uses snake_case mapping)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "budget_limit" DOUBLE PRECISION;
