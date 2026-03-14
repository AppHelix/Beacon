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

import { pgTable, serial, text, varchar, integer } from 'drizzle-orm/pg-core';

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