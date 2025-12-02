import db from '../../db.json';

export function getStaticParams() {
    const buildSlug = process.env.BUILD_SLUG;

    if (buildSlug && buildSlug !== 'all') {
        // If a specific slug is requested, only build that one
        const site = db.sites.find((s) => s.slug === buildSlug);
        if (site) {
            return [{ slug: site.slug }];
        }
        // If slug not found, maybe warn or return empty? 
        // Returning empty might cause build error if strict.
        // Let's return all or throw error. 
        // For safety, if not found, let's log and return empty array (which might skip it).
        console.warn(`Warning: Slug '${buildSlug}' not found in db.json. Building nothing.`);
        return [];
    }

    // Otherwise return all slugs
    return db.sites.map((site) => ({
        slug: site.slug,
    }));
}
