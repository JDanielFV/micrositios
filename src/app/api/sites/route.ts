import { NextResponse } from 'next/server';
import { siteQueries, uploadQueries } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const uploadsPath = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    console.log('Fetching sites from database...');
    const sites = await siteQueries.getAll();
    console.log(`Found ${sites.length} sites`);
    return NextResponse.json(sites, { status: 200 });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { message: 'Error al leer la base de datos', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const id = formData.get('id') as string;
    const slug = formData.get('slug') as string;
    const siteDataString = formData.get('siteData') as string;

    if (!id || !slug || !siteDataString) {
      return NextResponse.json(
        { message: 'Datos incompletos: se requiere id, slug y siteData' },
        { status: 400 }
      );
    }

    // Check if site already exists
    if (await siteQueries.exists(slug)) {
      return NextResponse.json(
        { message: 'El slug ya existe' },
        { status: 409 }
      );
    }

    const siteData = JSON.parse(siteDataString);

    // Handle file uploads
    const siteUploadsPath = path.join(uploadsPath, slug);
    await mkdir(siteUploadsPath, { recursive: true });

    // Process image files
    const imageFile = formData.get('imageFile') as File | null;
    if (imageFile && imageFile.size > 0) {
      const fileName = await saveFile(imageFile, siteUploadsPath);
      siteData.about.imageUrl = `/uploads/${slug}/${fileName}`;

      await uploadQueries.record(
        slug,
        fileName,
        imageFile.name,
        `/uploads/${slug}/${fileName}`,
        imageFile.type,
        imageFile.size
      );
    }

    // Process hero video
    const heroVideoFile = formData.get('heroVideoFile') as File | null;
    if (heroVideoFile && heroVideoFile.size > 0) {
      const fileName = await saveFile(heroVideoFile, siteUploadsPath);
      siteData.hero.videoUrl = `/uploads/${slug}/${fileName}`;

      await uploadQueries.record(
        slug,
        fileName,
        heroVideoFile.name,
        `/uploads/${slug}/${fileName}`,
        heroVideoFile.type,
        heroVideoFile.size
      );
    }

    // Process hero audio
    const heroAudioFile = formData.get('heroAudioFile') as File | null;
    if (heroAudioFile && heroAudioFile.size > 0) {
      const fileName = await saveFile(heroAudioFile, siteUploadsPath);
      siteData.hero.audioUrl = `/uploads/${slug}/${fileName}`;

      await uploadQueries.record(
        slug,
        fileName,
        heroAudioFile.name,
        `/uploads/${slug}/${fileName}`,
        heroAudioFile.type,
        heroAudioFile.size
      );
    }

    // Process hero logo
    const heroLogoFile = formData.get('heroLogoFile') as File | null;
    if (heroLogoFile && heroLogoFile.size > 0) {
      const fileName = await saveFile(heroLogoFile, siteUploadsPath);
      siteData.hero.logoUrl = `/uploads/${slug}/${fileName}`;

      await uploadQueries.record(
        slug,
        fileName,
        heroLogoFile.name,
        `/uploads/${slug}/${fileName}`,
        heroLogoFile.type,
        heroLogoFile.size
      );
    }

    // Process vCard
    const vCardFile = formData.get('vCardFile') as File | null;
    if (vCardFile && vCardFile.size > 0) {
      const fileName = await saveFile(vCardFile, siteUploadsPath);
      siteData.contactPage.vCardUrl = `/uploads/${slug}/${fileName}`;

      await uploadQueries.record(
        slug,
        fileName,
        vCardFile.name,
        `/uploads/${slug}/${fileName}`,
        vCardFile.type,
        vCardFile.size
      );
    }

    // Process splash video
    const splashVideoFile = formData.get('splashVideoFile') as File | null;
    if (splashVideoFile && splashVideoFile.size > 0) {
      const fileName = await saveFile(splashVideoFile, siteUploadsPath);
      siteData.splashScreen.videoUrl = `/uploads/${slug}/${fileName}`;

      await uploadQueries.record(
        slug,
        fileName,
        splashVideoFile.name,
        `/uploads/${slug}/${fileName}`,
        splashVideoFile.type,
        splashVideoFile.size
      );
    }

    // Process hero background image
    const heroBackgroundImageFile = formData.get('heroBackgroundImageFile') as File | null;
    if (heroBackgroundImageFile && heroBackgroundImageFile.size > 0) {
      const fileName = await saveFile(heroBackgroundImageFile, siteUploadsPath);
      siteData.hero.backgroundImageUrl = `/uploads/${slug}/${fileName}`;

      await uploadQueries.record(
        slug,
        fileName,
        heroBackgroundImageFile.name,
        `/uploads/${slug}/${fileName}`,
        heroBackgroundImageFile.type,
        heroBackgroundImageFile.size
      );
    }

    // Process icon files
    const iconFileEntries = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('iconFile-'));

    for (const [key, value] of iconFileEntries) {
      const indexMatch = key.match(/iconFile-(\d+)/);
      if (!indexMatch) continue;

      const index = parseInt(indexMatch[1], 10);
      const iconFile = value as unknown as File;

      if (iconFile && iconFile.size > 0) {
        const iconsPath = path.join(siteUploadsPath, 'icons');
        await mkdir(iconsPath, { recursive: true });

        const fileName = await saveFile(iconFile, iconsPath);

        if (siteData.contactPage.actions[index]) {
          siteData.contactPage.actions[index].iconUrl = `/uploads/${slug}/icons/${fileName}`;

          await uploadQueries.record(
            slug,
            fileName,
            iconFile.name,
            `/uploads/${slug}/icons/${fileName}`,
            iconFile.type,
            iconFile.size
          );
        }
      }
    }

    // Add last modification timestamp
    siteData.lastModification = {
      timestamp: new Date().toISOString()
    };

    // Insert into database
    await siteQueries.create(id, slug, siteData);

    return NextResponse.json(
      { message: 'Sitio creado correctamente', slug },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating site:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Error en el formato JSON de los datos' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Helper function to save files
async function saveFile(file: File, directory: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
  const filePath = path.join(directory, sanitizedFileName);
  await writeFile(filePath, buffer);
  return sanitizedFileName;
}
