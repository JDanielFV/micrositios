import { NextResponse } from 'next/server';
import { visitQueries } from '@/lib/db';

// GET: Retrieve all visits
export async function GET() {
    try {
        const visits = await visitQueries.getRecent(1000);
        return NextResponse.json(visits);
    } catch (error) {
        console.error('Error fetching visits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch visits' },
            { status: 500 }
        );
    }
}

// POST: Record a new visit
export async function POST(request: Request) {
    try {
        const { page, slug } = await request.json();

        // Get IP address
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

        // Get user agent
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Get referrer
        const referrer = request.headers.get('referer') || request.headers.get('referrer') || '';

        // Record visit
        await visitQueries.record(slug || 'unknown', page || 'unknown', ip, userAgent, referrer);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error recording visit:', error);
        return NextResponse.json(
            { error: 'Failed to record visit' },
            { status: 500 }
        );
    }
}
