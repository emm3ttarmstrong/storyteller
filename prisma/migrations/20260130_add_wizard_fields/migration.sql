-- Add wizard fields to Story table
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "genre" text;
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT ARRAY[]::text[];
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "isNsfw" boolean NOT NULL DEFAULT true;
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "contentLevel" integer NOT NULL DEFAULT 5;
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "tone" jsonb NOT NULL DEFAULT '{}';
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "modelParams" jsonb NOT NULL DEFAULT '{}';

-- Create Tag table
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "category" text NOT NULL,
    "description" text,
    "isNsfw" boolean NOT NULL DEFAULT false,
    "usageCount" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");
CREATE INDEX IF NOT EXISTS "Tag_category_idx" ON "Tag"("category");
CREATE INDEX IF NOT EXISTS "Tag_usageCount_idx" ON "Tag"("usageCount");
