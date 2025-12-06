import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("DEBUG: API Key loaded:", apiKey ? "YES (" + apiKey.substring(0, 5) + "...)" : "NO");

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API Key de Gemini no configurada en el servidor.' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { message: 'El prompt es requerido.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `
    You are an expert web developer and content strategist specializing in creating microsites for Notaries Public in Mexico.
    
    YOUR GOAL:
    Generate a complete, professional, and realistic JSON data structure for a notary microsite based on the user's prompt.
    
    CRITICAL INSTRUCTIONS FOR REALISM:
    1.  **USE REAL DATA:** If the user provides a specific Notary Name (e.g., "Notaría 178") and Location, you MUST use your internal knowledge to find the REAL address, phone number, and notary name (Titular) if available. Do not invent generic data if real data is retrievable.
    2.  **USE PROVIDED URL:** If the user provides a URL, assume it is the source of truth. Extract or infer the color palette, services, and tone from that URL's context if you can.
    3.  **PROFESSIONAL TONE:** The content must be formal, trustworthy, and legally accurate for the Mexican context.
    4.  **COLORS:** Generate a "Liquid Glass" aesthetic theme. Choose 2 harmonious colors (color1, color2) based on the notary's logo or branding (if known) or use professional legal colors (navy, dark red, slate, gold).
    
    JSON SCHEMA (Strictly follow this):
    {
      "theme": {
        "color1": "#hex",
        "color2": "#hex",
        "angle": 135,
        "fontImportUrl": "url to google fonts",
        "fontFamily": "css font family"
      },
      "metadata": {
        "title": "Notaría Pública [Number] - [City]",
        "description": "Professional description for SEO"
      },
      "navigation": [
        { "text": "Inicio", "link": "/" },
        { "text": "Ubicación", "link": "/ubicacion" },
        { "text": "Contacto", "link": "/contacto" }
      ],
      "hero": {
        "title": "Notaría Pública [Number]",
        "subtitle": "[Titular Name] or [Slogan]",
        "videoUrl": "",
        "logoUrl": "",
        "button": { "text": "Nuestros Servicios", "link": "/servicios" }
      },
      "about": {
        "title": "Acerca de Nosotros",
        "text": "Detailed, professional description of the notary's history and values.",
        "imageUrl": ""
      },
      "mainContact": {
        "title": "Contáctenos",
        "text": "Estamos para servirle via WhatsApp o teléfono.",
        "button": { "text": "Contactar", "link": "/contacto" }
      },
      "locationPage": {
        "address": "[REAL ADDRESS if known, otherwise realistic placeholder]",
        "mapIframeUrl": ""
      },
      "contactPage": {
        "title": "Centro de Contacto",
        "vCardUrl": "",
        "actions": [
           { "iconUrl": "/card.png", "text": "Guardar contacto", "link": "#" },
           { "iconUrl": "/wh.svg", "text": "WhatsApp", "link": "https://wa.me/52[REAL_NUMBER]" },
           { "iconUrl": "/phone.svg", "text": "Llamar", "link": "tel:+52[REAL_NUMBER]" },
           { "iconUrl": "/mail.svg", "text": "Email", "link": "mailto:[REAL_EMAIL]" }
        ]
      },
      "servicesPage": {
        "title": "Nuestros Servicios",
        "services": [
          { "title": "Service Name", "description": "Description" }
        ]
      },
      "splashScreen": {
        "enabled": false,
        "videoUrl": ""
      }
    }
    
    Output ONLY valid JSON. No markdown code blocks.
    `;

    const result = await model.generateContent(`${systemPrompt}\n\nUser Description: ${prompt}`);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const siteData = JSON.parse(text);

    return NextResponse.json({ data: siteData }, { status: 200 });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { message: 'Error al generar el contenido con IA.' },
      { status: 500 }
    );
  }
}
