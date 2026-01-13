import { getDB } from '../db';
import { testTable } from '../db/schema';

class TestService {
  getTestData() {
    const db = getDB();
    return db.select().from(testTable).all();
  }
}

export default new TestService();
