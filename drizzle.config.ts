import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src-electron/db/schema.ts',
  out: './src-electron/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./finance.db', // Dev usage
  },
  verbose: true,
  strict: true,
});
