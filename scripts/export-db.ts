#!/usr/bin/env bun
/**
 * Export database to JSON
 * 
 * Usage: bun run db:export [output-file]
 * Default output: db-export.json
 */

import { Database } from 'bun:sqlite';
import { writeFileSync } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const db = new Database(dbPath);

const outputFile = process.argv[2] || path.join(process.cwd(), 'db-export.json');

console.log('\n📤 Exporting database to JSON...\n');

const sites = db.prepare('SELECT * FROM sites ORDER BY slug').all() as any[];
const parsedSites = sites.map(site => ({
  id: site.id,
  slug: site.slug,
  data: JSON.parse(site.data as string)
}));

const output = {
  exportedAt: new Date().toISOString(),
  totalSites: parsedSites.length,
  sites: parsedSites
};

writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(`✅ Export complete!`);
console.log(`   Output: ${outputFile}`);
console.log(`   Total sites: ${parsedSites.length}\n`);

db.close();
