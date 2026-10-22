import { sqliteTable,text,integer } from 'drizzle-orm/sqlite-core';
export const contacts=sqliteTable('contacts',{id:text('id').primaryKey(),name:text('name').notNull(),email:text('email').notNull(),message:text('message').notNull(),created:integer('created').notNull()});
export const feedback=sqliteTable('feedback',{id:text('id').primaryKey(),name:text('name').notNull(),message:text('message').notNull(),status:text('status').notNull().default('pending'),created:integer('created').notNull()});
export const resumes=sqliteTable('resumes',{id:text('id').primaryKey(),key:text('key').notNull(),filename:text('filename').notNull(),published:integer('published').notNull().default(0),created:integer('created').notNull()});
export const limits=sqliteTable('limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
export const adminAccount=sqliteTable('admin_account',{id:integer('id').primaryKey(),username:text('username').notNull(),salt:text('salt').notNull(),passwordHash:text('password_hash').notNull(),totpSecret:text('totp_secret'),lastTotp:integer('last_totp').notNull().default(-1),recoveryHash:text('recovery_hash').notNull()});
export const adminSessions=sqliteTable('admin_sessions',{tokenHash:text('token_hash').primaryKey(),expires:integer('expires').notNull()});
