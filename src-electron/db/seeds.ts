import { getDB } from './index';
import { testTable } from './schema';
import { sql } from 'drizzle-orm';

export const seed = () => {
  try {
    const db = getDB();
    console.log('Checking if seed is needed...');
    const result = db
      .select({ count: sql`count(*)` })
      .from(testTable)
      .get();

    if (result && result.count === 0) {
      console.log('Seeding test_table...');
      db.insert(testTable)
        .values([{ name: 'Conta Corrente' }, { name: 'Cartão de Crédito' }, { name: 'Carteira' }])
        .run();
      console.log('Seed completed.');
    } else {
      console.log('Seed not needed, table has data.');
    }
  } catch (error) {
    console.error('Seed failed:', error);
  }
};
