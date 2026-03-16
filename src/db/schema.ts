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

// Beacon AI Conversations
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  conversationId: varchar('conversation_id', { length: 100 }).notNull().unique(), // External ID for API
  userId: varchar('user_id', { length: 255 }).notNull(), // Email or user ID
  title: varchar('title', { length: 255 }), // Auto-generated from first message
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Beacon AI Conversation Messages
export const conversationMessages = pgTable('conversation_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull(), // FK to conversations.id
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(), // Message content
  sources: text('sources'), // JSON array of source citations (for assistant messages)
  createdAt: text('created_at').notNull(),
});

// ============================================================================
// PHASE 09: Contribution Event Tracking
// ============================================================================
// Track all collaboration actions for recognition and leaderboard features

export const contributions = pgTable('contributions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // User email or ID
  userName: varchar('user_name', { length: 255 }).notNull(), // Display name
  actionType: varchar('action_type', { length: 50 }).notNull(), // 'signal_created', 'hand_raise', 'suggestion', 'signal_resolved', 'team_joined'
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'signal', 'engagement', 'user'
  entityId: integer('entity_id').notNull(), // ID of the related entity
  entityTitle: varchar('entity_title', { length: 255 }), // Optional title/name of entity for display
  metadata: text('metadata'), // JSON for additional context (skill tags, resolution notes, etc.)
  points: integer('points').notNull().default(0), // Points awarded for gamification
  createdAt: text('created_at').notNull(),
});

// User badges earned through contributions and milestones
export const userBadges = pgTable('user_badges', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // User email or ID
  userName: varchar('user_name', { length: 255 }).notNull(), // Display name
  badgeId: varchar('badge_id', { length: 50 }).notNull(), // Badge identifier (e.g., 'first_signal', 'contributor_10')
  awardedAt: text('awarded_at').notNull(), // When the badge was earned
});
