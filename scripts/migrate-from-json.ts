#!/usr/bin/env bun
/**
 * Migration script: JSON to SQLite
 * 
 * This script migrates all sites from db.json to the SQLite database.
 * Run with: bun run db:migrate
 */

import { createClient } from '@libsql/client';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const jsonPath = path.join(process.cwd(), 'db.json');
const backupPath = path.join(process.cwd(), 'db.json.backup');

console.log('🔄 Migrating from JSON to SQLite...\n');

// Check if db.json exists
if (!existsSync(jsonPath)) {
  console.error('❌ Error: db.json not found in project root');
  process.exit(1);
}

// Read and parse db.json
console.log('📄 Reading db.json...');
const dbJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));

if (!dbJson.sites || !Array.isArray(dbJson.sites)) {
  console.error('❌ Error: db.json must contain a "sites" array');
  process.exit(1);
}

console.log(`   Found ${dbJson.sites.length} sites to migrate\n`);

// Create database client
console.log('💾 Connecting to database...');
const db = createClient({
  url: `file:${dbPath}`,
});

// Initialize schema
await db.execute(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    page TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_slug TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    path TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_slug) REFERENCES sites(slug) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_visits_slug ON visits(slug);
  CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp);
  CREATE INDEX IF NOT EXISTS idx_visits_slug_timestamp ON visits(slug, timestamp);
  CREATE INDEX IF NOT EXISTS idx_uploads_site_slug ON uploads(site_slug);
`);

// Create backup of db.json
console.log('📋 Creating backup of db.json...');
writeFileSync(backupPath, readFileSync(jsonPath));
console.log(`   Backup saved to: ${backupPath}\n`);

// Prepare insert statement and migrate sites
console.log('📥 Inserting sites into database...\n');

for (const site of dbJson.sites) {
  await db.execute({
    sql: `
      INSERT OR REPLACE INTO sites (id, slug, data, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    args: [site.id, site.slug, JSON.stringify(site.data)]
  });
  console.log(`   ✓ Migrated: ${site.data.metadata?.title || site.slug} (${site.slug})`);
}

// Verify migration
const count = await db.execute('SELECT COUNT(*) as count FROM sites');
console.log(`\n✅ Migration complete!`);
console.log(`   Total sites in database: ${(count.rows[0] as any).count}`);

// Show summary
console.log('\n📊 Migrated sites:');
const sites = await db.execute('SELECT id, slug, data FROM sites');
for (const site of sites.rows as any[]) {
  const data = JSON.parse(site.data as string);
  console.log(`   • ${data.metadata?.title || 'Sin título'} - /${site.slug}`);
}

console.log('\n💡 Next steps:');
console.log('   1. Verify the migration worked correctly');
console.log('   2. Test the admin panel');
console.log('   3. Optionally remove or archive db.json');
console.log('   4. Run: bun run db:list to see all sites\n');
