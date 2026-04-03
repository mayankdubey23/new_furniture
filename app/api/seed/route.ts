import { NextResponse } from 'next/server';
import { seedProducts } from '@/lib/seed';

// Dev-only endpoint: GET /api/seed
// Seeds the database with initial product data.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const results = await seedProducts();
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
