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
      const filePath = path.join(siteUploadsPath, imageFile.name);
      
      await fs.writeFile(filePath, fileBuffer);
      
      siteData.about.imageUrl = `/uploads/${slug}/${imageFile.name}`;
    }

    if (heroVideoFile) {
      const siteUploadsPath = path.join(uploadsPath, slug);
      await fs.mkdir(siteUploadsPath, { recursive: true });
      
      const fileBuffer = Buffer.from(await heroVideoFile.arrayBuffer());
      const filePath = path.join(siteUploadsPath, heroVideoFile.name);
      
      await fs.writeFile(filePath, fileBuffer);
      
      siteData.hero.videoUrl = `/uploads/${slug}/${heroVideoFile.name}`;
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

                  const filePath = path.join(siteUploadsPath, vCardFile.name);

                  await fs.writeFile(filePath, fileBuffer);

                  siteData.contactPage.vCardUrl = `/uploads/${slug}/${vCardFile.name}`;

                }

            

                const splashVideoFile = formData.get('splashVideoFile') as File | null;

                if (splashVideoFile) {

                  const siteUploadsPath = path.join(uploadsPath, slug);

                  await fs.mkdir(siteUploadsPath, { recursive: true });

                  const fileBuffer = Buffer.from(await splashVideoFile.arrayBuffer());

                  const filePath = path.join(siteUploadsPath, splashVideoFile.name);

                  await fs.writeFile(filePath, fileBuffer);

                  siteData.splashScreen.videoUrl = `/uploads/${slug}/${splashVideoFile.name}`;

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

        

                    const filePath = path.join(siteIconsUploadsPath, iconFile.name);

        

                    await fs.writeFile(filePath, fileBuffer);

        

                    

        

                    // Update the iconUrl in siteData

        

                    if (siteData.contactPage.actions[index]) {

        

                      siteData.contactPage.actions[index].iconUrl = `/uploads/${slug}/icons/${iconFile.name}`;

        

                    }

        

                  }

        

                }

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