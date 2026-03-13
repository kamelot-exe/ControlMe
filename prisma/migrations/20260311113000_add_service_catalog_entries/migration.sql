CREATE TABLE IF NOT EXISTS "service_catalog_entries" (
  "id" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "group" TEXT NOT NULL,
  "subcategory" TEXT NOT NULL,
  "similarity_group" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "billing_period" TEXT NOT NULL,
  "website" TEXT NOT NULL,
  "logo_hint" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "default_need_score" INTEGER NOT NULL,
  "plan_rank" INTEGER NOT NULL DEFAULT 1,
  "is_family_plan" BOOLEAN NOT NULL DEFAULT false,
  "is_student_plan" BOOLEAN NOT NULL DEFAULT false,
  "is_business_plan" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "service_catalog_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_catalog_unique_entry"
  ON "service_catalog_entries"("service", "country", "plan", "currency", "billing_period");

CREATE INDEX IF NOT EXISTS "service_catalog_service_idx"
  ON "service_catalog_entries"("service");

CREATE INDEX IF NOT EXISTS "service_catalog_similarity_group_idx"
  ON "service_catalog_entries"("similarity_group");

CREATE INDEX IF NOT EXISTS "service_catalog_region_country_idx"
  ON "service_catalog_entries"("region", "country");

CREATE INDEX IF NOT EXISTS "service_catalog_group_idx"
  ON "service_catalog_entries"("group");
