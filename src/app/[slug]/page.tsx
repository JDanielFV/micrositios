import { siteQueries } from '@/lib/db';
import { Metadata } from 'next';
import { getStaticParams } from '../../utils/getStaticParams';
import PageContent from './PageContent';

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
    title: site?.data.metadata.title,
    description: site?.data.metadata.description,
  };
}

export default async function HomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getData(slug);

  if (!site) {
    return <div>Sitio no encontrado</div>;
  }

  return <PageContent initialSite={site} slug={slug} />;
}