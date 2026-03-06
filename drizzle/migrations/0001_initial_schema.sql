-- Beacon App - Initial Schema Migration
-- Phase 02: PostgreSQL Database Setup with Extensions

-- Enable required extensions for full-text search and vector operations
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL
);

-- Engagements table
CREATE TABLE IF NOT EXISTS "engagements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"description" text,
	"tech_tags" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);

-- Tech Tags table
CREATE TABLE IF NOT EXISTS "tech_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);

-- Signals table
CREATE TABLE IF NOT EXISTS "signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"engagement_id" integer NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL DEFAULT 'open',
	"urgency" varchar(50) NOT NULL DEFAULT 'medium',
	"required_skills" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "engagements_status_idx" ON "engagements" ("status");
CREATE INDEX IF NOT EXISTS "engagements_name_trgm_idx" ON "engagements" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "signals_engagement_id_idx" ON "signals" ("engagement_id");
CREATE INDEX IF NOT EXISTS "signals_status_idx" ON "signals" ("status");
CREATE INDEX IF NOT EXISTS "signals_title_trgm_idx" ON "signals" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "tech_tags_name_idx" ON "tech_tags" ("name");

-- Verify extensions are installed
-- SELECT extname FROM pg_extension WHERE extname IN ('pg_trgm', 'vector');
