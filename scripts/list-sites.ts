#!/usr/bin/env bun
/**
 * List all sites
 * 
 * Usage: bun run db:list
 */

import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const db = createClient({
  url: `file:${dbPath}`,
});

console.log('\n📁 Sitios registrados en la base de datos:\n');

const sites = await db.execute(`
  SELECT id, slug, data, created_at, updated_at 
  FROM sites 
  ORDER BY slug
`);

if (sites.rows.length === 0) {
  console.log('   No hay sitios registrados.\n');
  console.log('   Crea uno con: bun run db:create <id> <slug> [title]\n');
} else {
  for (const site of sites.rows as any[]) {
    const data = JSON.parse(site.data as string);
    const updated = new Date(site.updated_at as string).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log(`   ${data.metadata.title || 'Sin título'}`);
    console.log(`      ID: ${site.id}`);
    console.log(`      Slug: ${site.slug}`);
    console.log(`      Actualizado: ${updated}`);
    console.log(`      Edit: /admin/edit/${site.slug}`);
    console.log(`      View: /qrs/${site.slug}\n`);
  }

  console.log(`   Total: ${sites.rows.length} sitio${sites.rows.length !== 1 ? 's' : ''}\n`);
}

// Show stats
const statsSites = await db.execute('SELECT COUNT(*) as count FROM sites');
const statsVisits = await db.execute('SELECT COUNT(*) as count FROM visits');
const statsUploads = await db.execute('SELECT COUNT(*) as count FROM uploads');

console.log('📊 Estadísticas:');
console.log(`   Sitios: ${(statsSites.rows[0] as any).count}`);
console.log(`   Visitas registradas: ${(statsVisits.rows[0] as any).count}`);
console.log(`   Archivos subidos: ${(statsUploads.rows[0] as any).count}\n`);
