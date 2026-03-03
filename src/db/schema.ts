import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
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

export const techTags = pgTable('tech_tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});