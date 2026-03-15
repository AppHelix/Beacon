import { pgTable, serial, text, varchar, integer } from 'drizzle-orm/pg-core';

// Note: Using text for embeddings until pgvector is installed
// Once pgvector is available, uncomment the vector customType below and update embeddingJson → embedding

// Custom type for pgvector vector columns (currently disabled)
// const vector = customType<{ data: number[]; driverData: string }>({
//   dataType() {
//     return 'vector(1536)'; // OpenAI text-embedding-3-small/large dimension
//   },
//   toDriver(value: number[]): string {
//     return JSON.stringify(value);
//   },
//   fromDriver(value: string): number[] {
//     return JSON.parse(value);
//   },
// });

// Team membership for engagements
export const engagementTeamMembers = pgTable('engagement_team_members', {
  id: serial('id').primaryKey(),
  engagementId: integer('engagement_id').notNull(),
  userId: integer('user_id').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('member'), // e.g., member, lead, etc.
  addedAt: text('added_at').notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  lastSignIn: text('last_sign_in'),
  accountCreated: text('account_created'),
});

export const engagements = pgTable('engagements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  description: text('description'),
  techTags: text('tech_tags'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const signals = pgTable('signals', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  engagementId: integer('engagement_id').notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  urgency: varchar('urgency', { length: 50 }).notNull().default('medium'),
  requiredSkills: text('required_skills'),
  resolutionSummary: text('resolution_summary'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const techTags = pgTable('tech_tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const signalSuggestions = pgTable('signal_suggestions', {
  id: serial('id').primaryKey(),
  signalId: integer('signal_id').notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  suggestionText: text('suggestion_text').notNull(),
  createdAt: text('created_at').notNull(),
});

export const signalHandRaises = pgTable('signal_hand_raises', {
  id: serial('id').primaryKey(),
  signalId: integer('signal_id').notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  createdAt: text('created_at').notNull(),
});

// ============================================================================
// PHASE 07: AI/RAG Embedding Storage
// ============================================================================
// Note: Using JSON text format for embeddings until pgvector extension is installed
// Migration path: embedding_json (text) → embedding (vector) when pgvector is available

// Engagement embeddings for semantic search and RAG
export const engagementEmbeddings = pgTable('engagement_embeddings', {
  id: serial('id').primaryKey(),
  engagementId: integer('engagement_id').notNull(), // FK to engagements.id
  contentHash: varchar('content_hash', { length: 64 }).notNull(), // SHA-256 hash to detect changes
  embeddingJson: text('embedding_json').notNull(), // JSON array of 1536 floats (temporary until pgvector)
  dimensions: integer('dimensions').notNull().default(1536), // Track embedding dimensions
  metadata: text('metadata'), // JSON metadata: model version, chunk info, etc.
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Signal embeddings for semantic search and RAG
export const signalEmbeddings = pgTable('signal_embeddings', {
  id: serial('id').primaryKey(),
  signalId: integer('signal_id').notNull(), // FK to signals.id
  contentHash: varchar('content_hash', { length: 64 }).notNull(), // SHA-256 hash to detect changes
  embeddingJson: text('embedding_json').notNull(), // JSON array of 1536 floats (temporary until pgvector)
  dimensions: integer('dimensions').notNull().default(1536), // Track embedding dimensions
  metadata: text('metadata'), // JSON metadata: model version, chunk info, etc.
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
