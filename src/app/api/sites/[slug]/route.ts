import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dbPath = path.join(process.cwd(), 'db.json');
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');

// GET a single site by slug
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);

    const site = db.sites.find((site: any) => site.slug === slug);

    if (!site) {
      return NextResponse.json({ message: 'Sitio no encontrado' }, { status: 404 });
    }

    return NextResponse.json(site, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al leer la base de datos' }, { status: 500 });
  }
}

// UPDATE a site by slug
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const formData = await request.formData();
    const siteDataString = formData.get('siteData') as string;
    const imageFile = formData.get('imageFile') as File | null;
    const heroVideoFile = formData.get('heroVideoFile') as File | null;
    const heroLogoFile = formData.get('heroLogoFile') as File | null;

    const heroAudioFile = formData.get('heroAudioFile') as File | null;

    if (!siteDataString) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
    }

    const siteData = JSON.parse(siteDataString);
    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);

    const siteIndex = db.sites.findIndex((site: any) => site.slug === slug);

    if (siteIndex === -1) {
      return NextResponse.json({ message: 'Sitio no encontrado para actualizar' }, { status: 404 });
    }

    if (imageFile) {
      const siteUploadsPath = path.join(uploadsPath, slug);
      await fs.mkdir(siteUploadsPath, { recursive: true });
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      const sanitizedFileName = imageFile.name.replace(/\s+/g, '-');
      const filePath = path.join(siteUploadsPath, sanitizedFileName);
      await fs.writeFile(filePath, fileBuffer);
      siteData.about.imageUrl = `/uploads/${slug}/${sanitizedFileName}`;
    }

    if (heroVideoFile) {
      const siteUploadsPath = path.join(uploadsPath, slug);
      await fs.mkdir(siteUploadsPath, { recursive: true });
      const fileBuffer = Buffer.from(await heroVideoFile.arrayBuffer());
      const sanitizedFileName = heroVideoFile.name.replace(/\s+/g, '-');
      const filePath = path.join(siteUploadsPath, sanitizedFileName);
      await fs.writeFile(filePath, fileBuffer);
      siteData.hero.videoUrl = `/uploads/${slug}/${sanitizedFileName}`;
    }

    if (heroAudioFile) {
      const siteUploadsPath = path.join(uploadsPath, slug);
      await fs.mkdir(siteUploadsPath, { recursive: true });
      const fileBuffer = Buffer.from(await heroAudioFile.arrayBuffer());
      const sanitizedFileName = heroAudioFile.name.replace(/\s+/g, '-');
      const filePath = path.join(siteUploadsPath, sanitizedFileName);
      await fs.writeFile(filePath, fileBuffer);
      siteData.hero.audioUrl = `/uploads/${slug}/${sanitizedFileName}`;
    }

    if (heroLogoFile) {

      const siteUploadsPath = path.join(uploadsPath, slug);

      await fs.mkdir(siteUploadsPath, { recursive: true });

      const fileBuffer = Buffer.from(await heroLogoFile.arrayBuffer());

      const logoFileName = 'hero_logo.png'; // Fixed PNG filename

      const filePath = path.join(siteUploadsPath, logoFileName);

      await fs.writeFile(filePath, fileBuffer);

      siteData.hero.logoUrl = `/uploads/${slug}/${logoFileName}`;

    }



    const vCardFile = formData.get('vCardFile') as File | null;

    if (vCardFile) {

      const siteUploadsPath = path.join(uploadsPath, slug);

      await fs.mkdir(siteUploadsPath, { recursive: true });

      const fileBuffer = Buffer.from(await vCardFile.arrayBuffer());

      const sanitizedFileName = vCardFile.name.replace(/\s+/g, '-');

      const filePath = path.join(siteUploadsPath, sanitizedFileName);

      await fs.writeFile(filePath, fileBuffer);

      siteData.contactPage.vCardUrl = `/uploads/${slug}/${sanitizedFileName}`;

    }



    const splashVideoFile = formData.get('splashVideoFile') as File | null;

    if (splashVideoFile) {

      const siteUploadsPath = path.join(uploadsPath, slug);

      await fs.mkdir(siteUploadsPath, { recursive: true });

      const fileBuffer = Buffer.from(await splashVideoFile.arrayBuffer());

      const sanitizedFileName = splashVideoFile.name.replace(/\s+/g, '-');

      const filePath = path.join(siteUploadsPath, sanitizedFileName);

      await fs.writeFile(filePath, fileBuffer);

      siteData.splashScreen.videoUrl = `/uploads/${slug}/${sanitizedFileName}`;

    }



    // Handle icon file uploads



    const iconFileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('iconFile-'));







    for (const [key, value] of iconFileEntries) {



      const indexMatch = key.match(/iconFile-(\d+)/);



      if (!indexMatch) continue;







      const index = parseInt(indexMatch[1], 10);



      const iconFile = value as File;







      if (iconFile && iconFile.size > 0) { // Check if a file was actually uploaded



        const siteIconsUploadsPath = path.join(uploadsPath, slug, 'icons');



        await fs.mkdir(siteIconsUploadsPath, { recursive: true });



        const fileBuffer = Buffer.from(await iconFile.arrayBuffer());



        const sanitizedFileName = iconFile.name.replace(/\s+/g, '-');



        const filePath = path.join(siteIconsUploadsPath, sanitizedFileName);



        await fs.writeFile(filePath, fileBuffer);







        // Update the iconUrl in siteData



        if (siteData.contactPage.actions[index]) {



          siteData.contactPage.actions[index].iconUrl = `/uploads/${slug}/icons/${sanitizedFileName}`;



        }



      }



    }

    // Add last modification tracking
    siteData.lastModification = {
      timestamp: new Date().toISOString()
    };

    const originalSite = db.sites[siteIndex];
    db.sites[siteIndex] = {
      id: originalSite.id,
      slug: originalSite.slug,
      data: siteData,
    };

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'Sitio actualizado correctamente' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE a site by slug
export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);

    const siteIndex = db.sites.findIndex((site: any) => site.slug === slug);

    if (siteIndex === -1) {
      return NextResponse.json({ message: 'Sitio no encontrado para eliminar' }, { status: 404 });
    }

    db.sites.splice(siteIndex, 1);

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    // Delete uploads folder
    const siteUploadsPath = path.join(uploadsPath, slug);
    try {
      await fs.rm(siteUploadsPath, { recursive: true, force: true });
    } catch (folderError) {
      console.error(`No se pudo eliminar la carpeta ${siteUploadsPath}:`, folderError);
      // Don't fail the whole request if folder deletion fails
    }

    return NextResponse.json({ message: 'Sitio eliminado correctamente' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}