import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { adminMiddleware } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();
    const data = await request.json();
    const product = await Product.create(data);
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
