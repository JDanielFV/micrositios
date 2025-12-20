import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';


const dbPath = path.join(process.cwd(), 'db.json');
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);
    return NextResponse.json(db.sites, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al leer la base de datos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const id = formData.get('id') as string;
    const slug = formData.get('slug') as string;
    const siteDataString = formData.get('siteData') as string;
    const imageFile = formData.get('imageFile') as File | null;
    const heroVideoFile = formData.get('heroVideoFile') as File | null;
    const heroAudioFile = formData.get('heroAudioFile') as File | null;
    const heroLogoFile = formData.get('heroLogoFile') as File | null;

    if (!id || !slug || !siteDataString) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
    }

    const siteData = JSON.parse(siteDataString);

    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);

    const existingSite = db.sites.find((site: any) => site.id === id || site.slug === slug);
    if (existingSite) {
      return NextResponse.json({ message: 'El id o slug ya existe' }, { status: 409 });
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

    const heroBackgroundImageFile = formData.get('heroBackgroundImageFile') as File | null;

    if (heroBackgroundImageFile) {
      const siteUploadsPath = path.join(uploadsPath, slug);
      await fs.mkdir(siteUploadsPath, { recursive: true });
      const fileBuffer = Buffer.from(await heroBackgroundImageFile.arrayBuffer());
      const sanitizedFileName = heroBackgroundImageFile.name.replace(/\s+/g, '-');
      const filePath = path.join(siteUploadsPath, sanitizedFileName);
      await fs.writeFile(filePath, fileBuffer);
      siteData.hero.backgroundImageUrl = `/uploads/${slug}/${sanitizedFileName}`;
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

    const newSite = {
      id,
      slug,
      data: siteData,
    };

    db.sites.push(newSite);

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'Sitio añadido correctamente' }, { status: 201 });

  } catch (error) {
    console.error(error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Error en el formato JSON de los datos.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}