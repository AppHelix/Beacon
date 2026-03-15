-- Alternative embeddings schema without pgvector (temporary workaround for Phase 07)
-- This stores embeddings as JSON arrays instead of native vector type
-- Can be migrated to vector type once pgvector is installed

CREATE TABLE "engagement_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"engagement_id" integer NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"embedding_json" text NOT NULL,
	"dimensions" integer NOT NULL DEFAULT 1536,
	"metadata" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signal_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"signal_id" integer NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"embedding_json" text NOT NULL,
	"dimensions" integer NOT NULL DEFAULT 1536,
	"metadata" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
-- Add foreign key constraints
ALTER TABLE "engagement_embeddings" ADD CONSTRAINT "engagement_embeddings_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "signal_embeddings" ADD CONSTRAINT "signal_embeddings_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "signals"("id") ON DELETE CASCADE;
--> statement-breakpoint
-- Add indexes for performance
CREATE INDEX "engagement_embeddings_engagement_id_idx" ON "engagement_embeddings"("engagement_id");
--> statement-breakpoint
CREATE INDEX "engagement_embeddings_content_hash_idx" ON "engagement_embeddings"("content_hash");
--> statement-breakpoint
CREATE INDEX "signal_embeddings_signal_id_idx" ON "signal_embeddings"("signal_id");
--> statement-breakpoint
CREATE INDEX "signal_embeddings_content_hash_idx" ON "signal_embeddings"("content_hash");
--> statement-breakpoint
-- Note: This schema stores embeddings as JSON text
-- Once pgvector is installed, we can migrate to native vector type with:
-- ALTER TABLE engagement_embeddings ADD COLUMN embedding vector(1536);
-- UPDATE engagement_embeddings SET embedding = embedding_json::vector;
-- ALTER TABLE engagement_embeddings DROP COLUMN embedding_json;
