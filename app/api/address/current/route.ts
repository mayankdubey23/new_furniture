import { NextRequest, NextResponse } from 'next/server';
import {
  listCustomerAddresses,
  saveCustomerAddress,
} from '@/lib/server/customerAddresses';
import { getUserFromCookie } from '@/lib/userAuth';

export async function GET() {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const addresses = await listCustomerAddresses(user.userId);

  return NextResponse.json({ addresses });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    const address = await saveCustomerAddress(user.userId, payload);
    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save address.',
      },
      { status: 400 }
    );
  }
}
