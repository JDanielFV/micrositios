import { siteQueries } from '@/lib/db';
import { Metadata } from 'next';
import LocationContent from './LocationContent';
import { getStaticParams } from '../../../utils/getStaticParams';

async function getData(slug: string) {
  return await siteQueries.getBySlug(slug);
}

export async function generateStaticParams() {
  return await getStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await getData(slug);
  return {
    title: `Ubicación - ${site?.data.metadata.title}`,
    description: site?.data.metadata.description,
  };
}

export default async function UbicacionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getData(slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  return <LocationContent initialSite={site} slug={slug} />;
}
