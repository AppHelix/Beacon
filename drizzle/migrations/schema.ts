import { pgTable, serial, varchar, text, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const engagements = pgTable("engagements", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	clientName: varchar("client_name", { length: 255 }).notNull(),
	status: varchar({ length: 50 }).notNull(),
	description: text(),
	techTags: text("tech_tags"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const techTags = pgTable("tech_tags", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
});

export const signalHandRaises = pgTable("signal_hand_raises", {
	id: serial().primaryKey().notNull(),
	signalId: integer("signal_id").notNull(),
	userEmail: varchar("user_email", { length: 255 }).notNull(),
	userName: varchar("user_name", { length: 255 }).notNull(),
	createdAt: text("created_at").notNull(),
});

export const signals = pgTable("signals", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	engagementId: integer("engagement_id").notNull(),
	createdBy: varchar("created_by", { length: 255 }).notNull(),
	status: varchar({ length: 50 }).default('open').notNull(),
	urgency: varchar({ length: 50 }).default('medium').notNull(),
	requiredSkills: text("required_skills"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
	resolutionSummary: text("resolution_summary"),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).notNull(),
	lastSignIn: text("last_sign_in"),
	accountCreated: text("account_created"),
});

export const signalSuggestions = pgTable("signal_suggestions", {
	id: serial().primaryKey().notNull(),
	signalId: integer("signal_id").notNull(),
	userEmail: varchar("user_email", { length: 255 }).notNull(),
	userName: varchar("user_name", { length: 255 }).notNull(),
	suggestionText: text("suggestion_text").notNull(),
	createdAt: text("created_at").notNull(),
});

export const engagementTeamMembers = pgTable("engagement_team_members", {
	id: serial().primaryKey().notNull(),
	engagementId: integer("engagement_id").notNull(),
	userId: integer("user_id").notNull(),
	role: varchar({ length: 50 }).default('member').notNull(),
	addedAt: text("added_at").notNull(),
});
