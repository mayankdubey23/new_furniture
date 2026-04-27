import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { verifyAdmin } from '@/lib/auth';
import ChatbotTicket from '@/models/ChatbotTicket';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set(['open', 'in-review', 'contacted', 'resolved']);

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const status = cleanString(request.nextUrl.searchParams.get('status'));
    const query = status && VALID_STATUSES.has(status) ? { status } : {};
    const tickets = await ChatbotTicket.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      { tickets },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load chatbot tickets.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = cleanString(body.id);
    const status = cleanString(body.status);

    if (!id || !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: 'A valid ticket ID and status are required.' },
        { status: 400 }
      );
    }

    await dbConnect();
    const ticket = await ChatbotTicket.findByIdAndUpdate(
      id,
      {
        status,
        active: status !== 'resolved',
      },
      { returnDocument: 'after' }
    ).lean();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: 'Failed to update chatbot ticket.' }, { status: 500 });
  }
}
