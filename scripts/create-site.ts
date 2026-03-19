#!/usr/bin/env bun
/**
 * Create a new site
 * 
 * Usage: bun run db:create <id> <slug> [title]
 * 
 * Example: bun run db:create not-178 cancun "Notaría 178 Cancún"
 */

import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const db = createClient({
  url: `file:${dbPath}`,
});

const args = process.argv.slice(2);
const [id, slug, title] = args;

if (!id || !slug) {
  console.error('❌ Usage: bun run db:create <id> <slug> [title]');
  console.error('\nExamples:');
  console.error('  bun run db:create not-178 cancun "Notaría 178 Cancún"');
  console.error('  bun run db:create my-site my-slug');
  process.exit(1);
}

// Check if site already exists
const existing = await db.execute({
  sql: 'SELECT 1 FROM sites WHERE slug = ?',
  args: [slug]
});

if (existing.rows.length > 0) {
  console.error(`❌ Error: Site with slug "${slug}" already exists`);
  process.exit(1);
}

// Default site data structure
const defaultData = {
  theme: {
    color1: '#000000',
    color2: '#333333',
    angle: 90,
    fontImportUrl: '',
    fontFamily: ''
  },
  metadata: {
    title: title || 'Nuevo Sitio',
    description: ''
  },
  navigation: [
    { text: 'Inicio', link: '/' },
    { text: 'Ubicación', link: '/ubicacion' },
    { text: 'Contacto', link: '/contacto' }
  ],
  hero: {
    title: '',
    subtitle: '',
    videoUrl: '',
    logoUrl: '',
    button: {
      text: 'Nuestros Servicios',
      link: '/servicios'
    },
    backgroundImageUrl: ''
  },
  about: {
    title: 'Sobre Nosotros',
    text: '',
    imageUrl: ''
  },
  mainContact: {
    title: 'Contáctenos',
    text: '',
    button: {
      text: 'Contactar',
      link: '/contacto'
    }
  },
  locationPage: {
    address: '',
    mapIframeUrl: ''
  },
  contactPage: {
    title: 'Centro de Contacto',
    vCardUrl: '',
    actions: [
      { iconUrl: '/card.png', text: 'Guardar contacto', link: '' },
      { iconUrl: '/wh.svg', text: 'WhatsApp', link: '' },
      { iconUrl: '/sm.webp', text: 'Llamar Ahora', link: '' },
      { iconUrl: '/ml.webp', text: 'Enviar Email', link: '' }
    ]
  },
  servicesPage: {
    title: 'Nuestros Servicios',
    services: []
  },
  splashScreen: {
    enabled: false,
    videoUrl: ''
  },
  lastModification: {
    timestamp: new Date().toISOString()
  }
};

// Insert site
await db.execute({
  sql: `
    INSERT INTO sites (id, slug, data)
    VALUES (?, ?, ?)
  `,
  args: [id, slug, JSON.stringify(defaultData)]
});

console.log('✅ Site created successfully!\n');
console.log(`   ID: ${id}`);
console.log(`   Slug: ${slug}`);
console.log(`   Title: ${title || 'Nuevo Sitio'}`);
console.log(`\n📍 Edit at: /admin/edit/${slug}`);
console.log(`🌐 View at: /qrs/${slug}\n`);
