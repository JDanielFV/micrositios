import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const db = createClient({
  url: `file:${dbPath}`,
});

const slug = 'cus-39-loma';

// Get current data to preserve other fields
const result = await db.execute({
  sql: 'SELECT data FROM sites WHERE slug = ?',
  args: [slug]
});

if (result.rows.length > 0) {
  const currentData = JSON.parse(result.rows[0].data as string);
  
  // Update only the contactPage actions
  currentData.contactPage.actions = [
    { "iconUrl": "/card.png", "text": "Guardar contacto", "link": "" },
    { "iconUrl": "/sm.webp", "text": "Llamar Reclutamiento 1", "link": "tel:5549866164" },
    { "iconUrl": "/sm.webp", "text": "Llamar Reclutamiento 2", "link": "tel:5563597668" },
    { "iconUrl": "/ml.webp", "text": "Enviar Email", "link": "mailto:reclutamiento@cusaem.com.mx" } // Added a generic email placeholder as per usual pattern
  ];

  await db.execute({
    sql: 'UPDATE sites SET data = ? WHERE slug = ?',
    args: [JSON.stringify(currentData), slug]
  });

  console.log('✅ Site contact actions updated successfully!');
} else {
  console.error('❌ Site not found');
}
