import db from '../../db.json';

export function getStaticParams() {
    const buildSlug = process.env.BUILD_SLUG;

    if (buildSlug && buildSlug !== 'all') {
        // Support comma-separated slugs (e.g., "slug1,slug2,slug3")
        const slugs = buildSlug.split(',').map(s => s.trim()).filter(Boolean);
        
        if (slugs.length > 0) {
            // Filter existing sites from db.json
            const existingSlugs = db.sites
                .filter(site => slugs.includes(site.slug))
                .map(site => ({ slug: site.slug }));

            if (existingSlugs.length === 0) {
                console.warn(`Warning: None of the slugs [${slugs.join(', ')}] were found in db.json.`);
            }
            return existingSlugs;
        }
    }

    // Otherwise return all slugs
    return db.sites.map((site) => ({
        slug: site.slug,
    }));
}
