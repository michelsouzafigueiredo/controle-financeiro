import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { app, dialog } from 'electron';
import fs from 'fs';
import * as schema from './schema';
import { seed } from './seeds';

let db: ReturnType<typeof drizzle> | null = null;

const getDbPath = () => {
  if (process.env.DEV) {
    return path.resolve('finance.db');
  }
  return path.join(app.getPath('userData'), 'finance.db');
};

export const initializeDB = () => {
  if (db) return db;

  try {
    const dbPath = getDbPath();
    // console.log('Initializing database at:', dbPath);

    const sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });

    // Let's try to detect the path intelligently for debugging
    let finalMigrationPath = process.env.DEV
      ? path.resolve('src-electron/db/migrations')
      : path.join(process.resourcesPath, 'migrations');

    if (!process.env.DEV && !fs.existsSync(finalMigrationPath)) {
      // Fallback or debug
      // Try looking for 'src-electron/db/migrations' inside resources
      const candidate = path.join(process.resourcesPath, 'src-electron', 'db', 'migrations');
      if (fs.existsSync(candidate)) {
        finalMigrationPath = candidate;
      } else {
        // Debug info
        const resourcesContents = fs.readdirSync(process.resourcesPath);
        throw new Error(
          `Migrations folder not found. Resources: ${process.resourcesPath}, Contents: ${JSON.stringify(resourcesContents)}`,
        );
      }
    }

    // console.log('Running migrations from:', finalMigrationPath);

    migrate(db, { migrationsFolder: finalMigrationPath });

    // console.log('Running seeds...');
    seed();

    // console.log('Database initialized successfully.');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    dialog.showErrorBox(
      'Database Error',
      `Failed to initialize database:\n${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDB() first.');
  }
  return db;
};
