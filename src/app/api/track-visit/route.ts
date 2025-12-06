import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const visitsFilePath = path.join(process.cwd(), 'public', 'visits.json');

// Helper to read visits
function getVisits() {
    if (!fs.existsSync(visitsFilePath)) {
        return [];
    }
    const fileContent = fs.readFileSync(visitsFilePath, 'utf-8');
    try {
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

// GET: Retrieve all visits
export async function GET() {
    const visits = getVisits();
    return NextResponse.json(visits);
}

// POST: Record a new visit
export async function POST(request: Request) {
    try {
        const { page } = await request.json();

        // Get IP address (simplified for Next.js)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        const newVisit = {
            timestamp: new Date().toISOString(),
            page,
            ip
        };

        const visits = getVisits();
        visits.push(newVisit);

        fs.writeFileSync(visitsFilePath, JSON.stringify(visits, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error recording visit:', error);
        return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
    }
}
