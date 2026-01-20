import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  mood: text('mood'),
  energy: integer('energy'),
  intention: text('intention'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
