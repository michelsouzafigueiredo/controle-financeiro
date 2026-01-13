import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const testTable = sqliteTable('test_table', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
