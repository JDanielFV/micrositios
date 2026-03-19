import { siteQueries } from '@/lib/db';

export async function getStaticParams() {
    const buildSlug = process.env.BUILD_SLUG;
    const sites = await siteQueries.getAll();

    if (buildSlug && buildSlug !== 'all') {
        // Support comma-separated slugs (e.g., "slug1,slug2,slug3")
        const slugs = buildSlug.split(',').map(s => s.trim()).filter(Boolean);
        
        if (slugs.length > 0) {
            // Filter existing sites from database
            const existingSlugs = sites
                .filter(site => slugs.includes(site.slug))
                .map(site => ({ slug: site.slug }));

            if (existingSlugs.length === 0) {
                console.warn(`Warning: None of the slugs [${slugs.join(', ')}] were found in the database.`);
            }
            return existingSlugs;
        }
    }

    // Otherwise return all slugs from database
    return sites.map((site) => ({
        slug: site.slug,
    }));
}
