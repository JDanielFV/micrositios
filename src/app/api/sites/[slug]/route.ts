import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dbPath = path.join(process.cwd(), 'db.json');
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');

// GET a single site by slug
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);
    
    const site = db.sites.find((site: any) => site.slug === params.slug);

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
export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const formData = await request.formData();
    const siteDataString = formData.get('siteData') as string;
    const imageFile = formData.get('imageFile') as File | null;
    const heroVideoFile = formData.get('heroVideoFile') as File | null;
    const heroLogoFile = formData.get('heroLogoFile') as File | null;

    if (!siteDataString) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
    }

    const siteData = JSON.parse(siteDataString);
    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);

    const siteIndex = db.sites.findIndex((site: any) => site.slug === params.slug);

    if (siteIndex === -1) {
      return NextResponse.json({ message: 'Sitio no encontrado para actualizar' }, { status: 404 });
    }

    if (imageFile) {
      const siteUploadsPath = path.join(uploadsPath, params.slug);
      await fs.mkdir(siteUploadsPath, { recursive: true });
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      const filePath = path.join(siteUploadsPath, imageFile.name);
      await fs.writeFile(filePath, fileBuffer);
      siteData.about.imageUrl = `/uploads/${params.slug}/${imageFile.name}`;
    }

    if (heroVideoFile) {
      const siteUploadsPath = path.join(uploadsPath, params.slug);
      await fs.mkdir(siteUploadsPath, { recursive: true });
      const fileBuffer = Buffer.from(await heroVideoFile.arrayBuffer());
      const filePath = path.join(siteUploadsPath, heroVideoFile.name);
      await fs.writeFile(filePath, fileBuffer);
      siteData.hero.videoUrl = `/uploads/${params.slug}/${heroVideoFile.name}`;
    }

            if (heroLogoFile) {

              const siteUploadsPath = path.join(uploadsPath, params.slug);

              await fs.mkdir(siteUploadsPath, { recursive: true });

              const fileBuffer = Buffer.from(await heroLogoFile.arrayBuffer());

              const logoFileName = 'hero_logo.png'; // Fixed PNG filename

              const filePath = path.join(siteUploadsPath, logoFileName);

              await fs.writeFile(filePath, fileBuffer);

              siteData.hero.logoUrl = `/uploads/${params.slug}/${logoFileName}`;

            }

    

        const vCardFile = formData.get('vCardFile') as File | null;

                if (vCardFile) {

                  const siteUploadsPath = path.join(uploadsPath, params.slug);

                  await fs.mkdir(siteUploadsPath, { recursive: true });

                  const fileBuffer = Buffer.from(await vCardFile.arrayBuffer());

                  const filePath = path.join(siteUploadsPath, vCardFile.name);

                  await fs.writeFile(filePath, fileBuffer);

                  siteData.contactPage.vCardUrl = `/uploads/${params.slug}/${vCardFile.name}`;

                }

            

                const splashVideoFile = formData.get('splashVideoFile') as File | null;

                if (splashVideoFile) {

                  const siteUploadsPath = path.join(uploadsPath, params.slug);

                  await fs.mkdir(siteUploadsPath, { recursive: true });

                  const fileBuffer = Buffer.from(await splashVideoFile.arrayBuffer());

                  const filePath = path.join(siteUploadsPath, splashVideoFile.name);

                  await fs.writeFile(filePath, fileBuffer);

                  siteData.splashScreen.videoUrl = `/uploads/${params.slug}/${splashVideoFile.name}`;

                }

        

                // Handle icon file uploads

        

                const iconFileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('iconFile-'));

        

            

        

                for (const [key, value] of iconFileEntries) {

        

                  const indexMatch = key.match(/iconFile-(\d+)/);

        

                  if (!indexMatch) continue;

        

            

        

                  const index = parseInt(indexMatch[1], 10);

        

                  const iconFile = value as File;

        

            

        

                  if (iconFile && iconFile.size > 0) { // Check if a file was actually uploaded

        

                    const siteIconsUploadsPath = path.join(uploadsPath, params.slug, 'icons');

        

                    await fs.mkdir(siteIconsUploadsPath, { recursive: true });

        

                    const fileBuffer = Buffer.from(await iconFile.arrayBuffer());

        

                    const filePath = path.join(siteIconsUploadsPath, iconFile.name);

        

                    await fs.writeFile(filePath, fileBuffer);

        

                    

        

                    // Update the iconUrl in siteData

        

                    if (siteData.contactPage.actions[index]) {

        

                      siteData.contactPage.actions[index].iconUrl = `/uploads/${params.slug}/icons/${iconFile.name}`;

        

                    }

        

                  }

        

                }

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
export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  try {
    const dbData = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbData);

    const siteIndex = db.sites.findIndex((site: any) => site.slug === params.slug);

    if (siteIndex === -1) {
      return NextResponse.json({ message: 'Sitio no encontrado para eliminar' }, { status: 404 });
    }

    db.sites.splice(siteIndex, 1);

    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    // Delete uploads folder
    const siteUploadsPath = path.join(uploadsPath, params.slug);
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