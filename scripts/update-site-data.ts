import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const db = createClient({
  url: `file:${dbPath}`,
});

const slug = 'not-4-ensenada';
const newData = {
    "theme": {
      "color1": "#000000",
      "color2": "#4A4A4A",
      "angle": "180",
      "fontImportUrl": "",
      "fontFamily": ""
    },
    "metadata": {
      "title": "Notaría Pública 4 Ensenada - Lic. Ángel Saad Said",
      "description": "Servicios notariales de excelencia en Ensenada, Baja California."
    },
    "navigation": [
        { "text": "Inicio", "link": "/" },
        { "text": "Ubicación", "link": "/ubicacion" },
        { "text": "Contacto", "link": "/contacto" }
    ],
    "hero": {
      "title": "Notaría Pública 4",
      "subtitle": "Lic. Ángel Saad Said - Titular",
      "button": {
        "text": "Nuestros Servicios",
        "link": "/servicios"
      },
      "videoUrl": "",
      "logoUrl": "",
      "backgroundImageUrl": ""
    },
    "about": {
      "title": "Sobre Nosotros",
      "text": "Notaría dedicada a brindar seguridad jurídica y asesoría profesional en Ensenada, Baja California, con profesionalismo y confianza en cada trámite.",
      "imageUrl": ""
    },
    "mainContact": {
      "title": "Estamos para servirle",
      "text": "Contáctenos para agendar una cita o recibir asesoría personalizada sobre sus trámites legales.",
      "button": {
        "text": "Contactar",
        "link": "/contacto"
      }
    },
    "locationPage": {
      "address": "Av. Moctezuma No. 671, Zona Centro, Ensenada, B.C., C.P. 22800.",
      "mapIframeUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3389.0127941593364!2d-116.61604119999997!3d31.851867100000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8126119ae470bb6f%3A0xa48cd663aee6aa3d!2sNotar%C3%ADa%20P%C3%BAblica%20No.%208%20Ensenada!5e0!3m2!1ses-419!2smx!4v1772478487125!5m2!1ses-419!2smx"
    },
    "contactPage": {
      "title": "Centro de Contacto",
      "vCardUrl": "",
      "actions": [
        { "iconUrl": "/card.png", "text": "Guardar contacto", "link": "" },
        { "iconUrl": "/wh.svg", "text": "WhatsApp", "link": "https://wa.me/526461783707" },
        { "iconUrl": "/sm.webp", "text": "Llamar Ahora", "link": "tel:6461783707" },
        { "iconUrl": "/ml.webp", "text": "Enviar Email", "link": "mailto:notaria@not4eda.com" }
      ]
    },
    "servicesPage": {
      "title": "Nuestros Servicios",
      "services": [
        { "title": "Testamentos", "description": "Asesoría y redacción de testamentos." },
        { "title": "Poderes Notariales", "description": "Formalización de poderes para diversos actos." },
        { "title": "Compraventas", "description": "Formalización de operaciones inmobiliarias." },
        { "title": "Constitución de Sociedades", "description": "Asesoría en creación de empresas." }
      ]
    },
    "splashScreen": {
      "enabled": false,
      "videoUrl": ""
    },
    "lastModification": {
      "timestamp": new Date().toISOString()
    }
};

await db.execute({
  sql: 'UPDATE sites SET data = ? WHERE slug = ?',
  args: [JSON.stringify(newData), slug]
});

console.log('✅ Site data updated successfully!');
