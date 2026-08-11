import { createClient } from '@libsql/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'micrositios.db');
const db = createClient({
  url: `file:${dbPath}`,
});

const slug = 'not-8-veracruz';
const newData = {
    "theme": {
      "color1": "#0077B6",
      "color2": "#005F8A",
      "angle": "135",
      "fontImportUrl": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap",
      "fontFamily": "'Playfair Display', serif"
    },
    "metadata": {
      "title": "Notaría Pública No. 8 de Veracruz - Lic. José Carlos Velázquez Vázquez",
      "description": "Servicios notariales de excelencia en el puerto de Veracruz. Testamentos, escrituras, poderes, constitución de sociedades y más. Lic. José Carlos Velázquez Vázquez, Notario Titular."
    },
    "navigation": [
        { "text": "Inicio", "link": "/" },
        { "text": "Ubicación", "link": "/ubicacion" },
        { "text": "Contacto", "link": "/contacto" }
    ],
    "hero": {
      "title": "Fe Pública con Tradición y Compromiso en el Puerto de Veracruz",
      "subtitle": "El Lic. José Carlos Velázquez Vázquez y su equipo de profesionales le brindan certeza jurídica con un servicio personalizado, ágil y de la más alta calidad. Su patrimonio, en las mejores manos.",
      "button": {
        "text": "Nuestros Servicios",
        "link": "/servicios"
      },
      "videoUrl": "",
      "logoUrl": "",
      "backgroundImageUrl": ""
    },
    "about": {
      "title": "Excelencia Notarial en Veracruz",
      "text": "La Notaría Pública No. 8 de Veracruz, bajo la titularidad del Lic. José Carlos Velázquez Vázquez, se distingue por su compromiso con la seguridad jurídica y la atención personalizada. Con amplia experiencia en el ejercicio de la fe pública, ofrecemos un servicio integral que combina rigor profesional con un trato humano y cercano, acompañándole en cada trámite notarial que su patrimonio y bienestar requieren.",
      "imageUrl": ""
    },
    "mainContact": {
      "title": "A Su Servicio",
      "text": "Permítanos asesorarle con la dedicación y profesionalismo que usted merece. Contáctenos hoy para agendar una cita o resolver cualquier consulta sobre nuestros servicios notariales.",
      "button": {
        "text": "Contactar Ahora",
        "link": "/contacto"
      }
    },
    "locationPage": {
      "address": "Agustín de Iturbide No. 308, Col. Ricardo Flores Magón, C.P. 91900, Veracruz, Ver.",
      "mapIframeUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.123!2d-96.1332!3d19.1793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAgust%C3%ADn+de+Iturbide+308%2C+Col.+Ricardo+Flores+Mag%C3%B3n%2C+91900+Veracruz%2C+Ver.!5e0!3m2!1ses-419!2smx"
    },
    "contactPage": {
      "title": "Centro de Contacto",
      "vCardUrl": "",
      "actions": [
        { "iconUrl": "/card.png", "text": "Guardar contacto", "link": "" },
        { "iconUrl": "/wh.svg", "text": "WhatsApp", "link": "https://wa.me/522293754692" },
        { "iconUrl": "/sm.webp", "text": "Llamar Ahora", "link": "tel:2293754692" },
        { "iconUrl": "/ml.webp", "text": "Enviar Email", "link": "mailto:info@notaria8veracruz.com" }
      ]
    },
    "servicesPage": {
      "title": "Nuestros Servicios",
      "services": [
        { "title": "Testamentos", "description": "Asesoría y formalización de su última voluntad con total confidencialidad y seguridad jurídica." },
        { "title": "Compraventa de Inmuebles", "description": "Escrituración de operaciones inmobiliarias, garantizando la protección de su patrimonio en cada transacción." },
        { "title": "Constitución de Sociedades", "description": "Creación de actas constitutivas, reformas estatutarias y asesoría legal para personas morales." },
        { "title": "Poderes Notariales", "description": "Otorgamiento de poderes generales y especiales para la representación legal de personas físicas y morales." },
        { "title": "Certificaciones", "description": "Cotejo de documentos, ratificación de firmas, fe de hechos y demás certificaciones notariales." },
        { "title": "Sucesiones", "description": "Trámites de sucesiones testamentarias e intestamentarias, adjudicación de herencias y asesoría integral." }
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
