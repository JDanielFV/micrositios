import { siteQueries } from '@/lib/db';
import { Metadata } from 'next';
import ServicesContent from './ServicesContent';
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
    title: `Servicios - ${site?.data.metadata.title}`,
    description: site?.data.metadata.description,
  };
}

export default async function ServiciosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getData(slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  return <ServicesContent initialSite={site} slug={slug} />;
}
