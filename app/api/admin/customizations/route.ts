import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Customization from '@/models/Customization';
import { verifyAdmin } from '@/lib/auth';
import type { ICustomization } from '@/models/Customization';

type CustomizationQuery = {
  status?: ICustomization['status'];
  $or?: Array<
    Partial<
      Record<
        'customerName' | 'customerEmail' | 'productName',
        { $regex: string; $options: 'i' }
      >
    >
  >;
};

type CustomizationUpdate = Partial<
  Pick<ICustomization, 'status' | 'adminNotes' | 'contactedAt' | 'completedAt'>
>;
const VALID_STATUSES = [
  'pending',
  'in-review',
  'approved',
  'contacted',
  'completed',
  'rejected',
] as const;
type CustomizationStatus = (typeof VALID_STATUSES)[number];

export async function GET(request: NextRequest) {
  try {

    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const statusParam = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const status = VALID_STATUSES.find((value) => value === statusParam);

    const query: CustomizationQuery = {};

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

    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, status: statusParam, adminNotes } = body as {
      id?: string;
      status?: string;
      adminNotes?: string;
    };
    const status = VALID_STATUSES.find((value) => value === statusParam);

    if (!id || !status) {
      return NextResponse.json(
        { error: 'A valid ID and status are required' },
        { status: 400 }
      );
    }

    const updateData: CustomizationUpdate = { status: status as CustomizationStatus };

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
