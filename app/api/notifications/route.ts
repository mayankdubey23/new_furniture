import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';
import { getUserFromCookie } from '@/lib/userAuth';

export async function GET(request: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const requestedLimit = Number(request.nextUrl.searchParams.get('limit') || 6);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 20)
      : 6;
    const email = user.email.trim().toLowerCase();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ email }).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ email, read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    const body = (await request.json().catch(() => ({}))) as { ids?: string[] };
    const email = user.email.trim().toLowerCase();
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
    const filter = ids.length
      ? { email, _id: { $in: ids } }
      : { email, read: false };

    await Notification.updateMany(filter, {
      $set: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
