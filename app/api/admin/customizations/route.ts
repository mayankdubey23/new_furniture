import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Customization from '@/models/Customization';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const status = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
      ];
    }
    
    const total = await Customization.countDocuments(query);
    const customizations = await Customization.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      customizations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin customizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customizations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const body = await request.json();
    const { id, status, adminNotes } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }
    
    const updateData: any = { status };
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    if (status === 'contacted') {
      updateData.contactedAt = new Date();
    }
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    const customization = await Customization.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!customization) {
      return NextResponse.json(
        { error: 'Customization not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      customization,
    });
  } catch (error) {
    console.error('Error updating customization:', error);
    return NextResponse.json(
      { error: 'Failed to update customization' },
      { status: 500 }
    );
  }
}
