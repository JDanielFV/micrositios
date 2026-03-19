import { createClient, Client, ResultSet } from '@libsql/client';
import path from 'path';

// Database path - use environment variable or resolve from project root
const getDbPath = () => {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  
  const possiblePaths = [
    path.join(process.cwd(), 'micrositios.db'),
    path.join(process.cwd(), '..', 'micrositios.db'),
  ];
  
  for (const dbPath of possiblePaths) {
    try {
      const { existsSync } = require('fs');
      if (existsSync(dbPath)) {
        return dbPath;
      }
    } catch {}
  }
  
  return path.join(process.cwd(), 'micrositios.db');
};

const dbPath = getDbPath();

// Create database client
let db: Client;

export function getDb(): Client {
  if (!db) {
    db = createClient({
      url: `file:${dbPath}`,
    });
  }
  return db;
}

// Initialize database schema
async function initializeDatabase() {
  const client = getDb();
  
  // Optimization for concurrent access (build workers)
  try {
    await client.execute('PRAGMA journal_mode = WAL;');
    await client.execute('PRAGMA synchronous = NORMAL;');
  } catch (e) {
    console.warn('Could not set PRAGMA settings:', e);
  }
  
  await client.execute(`
    -- Sites table: stores all microsite configurations
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Visits table: analytics tracking
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      page TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      referrer TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Uploads table: track uploaded files
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

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_visits_slug ON visits(slug);
    CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp);
    CREATE INDEX IF NOT EXISTS idx_visits_slug_timestamp ON visits(slug, timestamp);
    CREATE INDEX IF NOT EXISTS idx_uploads_site_slug ON uploads(site_slug);
  `);
}

// Initialize on module load
initializeDatabase().catch(console.error);

// Helper functions
export const siteQueries = {
  // Get all sites
  getAll: async () => {
    const client = getDb();
    const result = await client.execute('SELECT * FROM sites ORDER BY slug');
    return result.rows.map((row: any) => ({
      ...row,
      data: JSON.parse(row.data as string)
    }));
  },

  // Get site by slug
  getBySlug: async (slug: string) => {
    const client = getDb();
    const result = await client.execute({
      sql: 'SELECT * FROM sites WHERE slug = ?',
      args: [slug]
    });
    if (result.rows.length > 0) {
      const row = result.rows[0] as any;
      return { ...row, data: JSON.parse(row.data as string) };
    }
    return null;
  },

  // Get site by ID
  getById: async (id: string) => {
    const client = getDb();
    const result = await client.execute({
      sql: 'SELECT * FROM sites WHERE id = ?',
      args: [id]
    });
    if (result.rows.length > 0) {
      const row = result.rows[0] as any;
      return { ...row, data: JSON.parse(row.data as string) };
    }
    return null;
  },

  // Create new site
  create: async (id: string, slug: string, data: any) => {
    const client = getDb();
    return await client.execute({
      sql: `
        INSERT INTO sites (id, slug, data)
        VALUES (?, ?, ?)
      `,
      args: [id, slug, JSON.stringify(data)]
    });
  },

  // Update site
  update: async (slug: string, data: any) => {
    const client = getDb();
    return await client.execute({
      sql: `
        UPDATE sites 
        SET data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE slug = ?
      `,
      args: [JSON.stringify(data), slug]
    });
  },

  // Delete site
  delete: async (slug: string) => {
    const client = getDb();
    return await client.execute({
      sql: 'DELETE FROM sites WHERE slug = ?',
      args: [slug]
    });
  },

  // Check if site exists
  exists: async (slug: string) => {
    const client = getDb();
    const result = await client.execute({
      sql: 'SELECT 1 FROM sites WHERE slug = ?',
      args: [slug]
    });
    return result.rows.length > 0;
  }
};

export const visitQueries = {
  // Record a visit
  record: async (slug: string, page: string, ip: string, userAgent: string, referrer?: string) => {
    const client = getDb();
    return await client.execute({
      sql: `
        INSERT INTO visits (slug, page, ip, user_agent, referrer)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [slug, page, ip, userAgent, referrer || null]
    });
  },

  // Get all visits
  getAll: async () => {
    const client = getDb();
    const result = await client.execute('SELECT * FROM visits ORDER BY timestamp DESC');
    return result.rows;
  },

  // Get visits by slug
  getBySlug: async (slug: string) => {
    const client = getDb();
    const result = await client.execute({
      sql: 'SELECT * FROM visits WHERE slug = ? ORDER BY timestamp DESC',
      args: [slug]
    });
    return result.rows;
  },

  // Get visits count
  getCount: async () => {
    const client = getDb();
    const result = await client.execute('SELECT COUNT(*) as count FROM visits');
    return (result.rows[0] as any)?.count || 0;
  },

  // Get unique IPs count
  getUniqueIpsCount: async () => {
    const client = getDb();
    const result = await client.execute('SELECT COUNT(DISTINCT ip) as count FROM visits');
    return (result.rows[0] as any)?.count || 0;
  },

  // Get visits by page
  getByPage: async () => {
    const client = getDb();
    const result = await client.execute(`
      SELECT page, COUNT(*) as count 
      FROM visits 
      GROUP BY page 
      ORDER BY count DESC
    `);
    return result.rows;
  },

  // Get recent visits
  getRecent: async (limit: number = 100) => {
    const client = getDb();
    const result = await client.execute({
      sql: 'SELECT * FROM visits ORDER BY timestamp DESC LIMIT ?',
      args: [limit]
    });
    return result.rows;
  },

  // Get visits today
  getToday: async () => {
    const client = getDb();
    const result = await client.execute(`
      SELECT COUNT(*) as count FROM visits 
      WHERE DATE(timestamp) = DATE('now')
    `);
    return (result.rows[0] as any)?.count || 0;
  }
};

export const uploadQueries = {
  // Record an upload
  record: async (siteSlug: string, filename: string, originalName: string, path: string, mimeType: string, size: number) => {
    const client = getDb();
    return await client.execute({
      sql: `
        INSERT INTO uploads (site_slug, filename, original_name, path, mime_type, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [siteSlug, filename, originalName, path, mimeType, size]
    });
  },

  // Get uploads by site
  getBySite: async (siteSlug: string) => {
    const client = getDb();
    const result = await client.execute({
      sql: 'SELECT * FROM uploads WHERE site_slug = ? ORDER BY uploaded_at DESC',
      args: [siteSlug]
    });
    return result.rows;
  },

  // Get upload by filename
  getByFilename: async (siteSlug: string, filename: string) => {
    const client = getDb();
    const result = await client.execute({
      sql: 'SELECT * FROM uploads WHERE site_slug = ? AND filename = ?',
      args: [siteSlug, filename]
    });
    return result.rows[0];
  },

  // Delete upload record
  delete: async (id: number) => {
    const client = getDb();
    return await client.execute({
      sql: 'DELETE FROM uploads WHERE id = ?',
      args: [id]
    });
  }
};

export default getDb;
