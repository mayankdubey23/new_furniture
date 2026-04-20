import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Address from '@/models/Address';
import {
  deleteCustomerAddress,
  saveCustomerAddress,
  serializeCustomerAddress,
} from '@/lib/server/customerAddresses';
import { getUserFromCookie } from '@/lib/userAuth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  const address = await Address.findOne({ _id: id, user: user.userId }).lean();

  if (!address) {
    return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
  }

  return NextResponse.json({ address: serializeCustomerAddress(address) });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    const address = await saveCustomerAddress(user.userId, payload, { id });
    return NextResponse.json({ success: true, address });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update address.',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteCustomerAddress(user.userId, id);

  if (!deleted) {
    return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
