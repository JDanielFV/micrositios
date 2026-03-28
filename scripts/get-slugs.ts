import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const db = createClient({
  url: `file:${dbPath}`,
});

const result = await db.execute('SELECT slug FROM sites ORDER BY slug');
console.log(result.rows.map(r => r.slug).join(' '));
process.exit(0);
