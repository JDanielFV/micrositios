'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Skip tracking for admin pages
        if (pathname.startsWith('/admin')) return;

        const trackVisit = async () => {
            try {
                await fetch('/tracker.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ page: pathname }),
                });
            } catch (error) {
                console.error('Error tracking visit:', error);
            }
        };

        trackVisit();
    }, [pathname]);

    return null;
}
