import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { adminMiddleware } from '@/lib/auth';
import Order, {
  type IOrder,
  type IReturnRefundRequest,
  type ReturnRefundRequestStatus,
  type ReturnRefundRequestType,
} from '@/models/Order';
import { getUserFromCookie } from '@/lib/userAuth';
import { sanitizeOrderForClient } from '@/lib/server/orderLifecycle';

const ALLOWED_REQUEST_TYPES: ReturnRefundRequestType[] = [
  'return',
  'refund',
  'return-refund',
];
const ALLOWED_REQUEST_STATUSES: ReturnRefundRequestStatus[] = [
  'requested',
  'approved',
  'rejected',
  'received',
  'refunded',
  'closed',
];
const ACTIVE_REQUEST_STATUSES = new Set<ReturnRefundRequestStatus>([
  'requested',
  'approved',
  'received',
  'refunded',
]);
const ELIGIBLE_ORDER_STATUSES = new Set<IOrder['status']>(['paid', 'shipped', 'delivered']);

function cleanString(value: unknown, maxLength = 400) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeEmail(value: unknown) {
  return cleanString(value, 160).toLowerCase();
}

function normalizeRefundAmount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Number(parsed.toFixed(2)) : null;
}

function normalizeSelectedItems(
  value: unknown,
  orderItems: Array<{ productId?: string; name?: string; quantity?: number }>
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const rawIndex = Number((entry as { itemIndex?: unknown }).itemIndex);
      if (!Number.isInteger(rawIndex) || rawIndex < 0 || rawIndex >= orderItems.length) {
        return null;
      }

      const sourceItem = orderItems[rawIndex];
      if (!sourceItem?.name) {
        return null;
      }

      const rawQuantity = Number((entry as { quantity?: unknown }).quantity);
      const quantity = Number.isInteger(rawQuantity) && rawQuantity > 0
        ? Math.min(rawQuantity, Number(sourceItem.quantity || 0))
        : Number(sourceItem.quantity || 0);

      if (quantity <= 0) {
        return null;
      }

      return {
        itemIndex: rawIndex,
        productId: String(sourceItem.productId || '').trim() || undefined,
        name: String(sourceItem.name || '').trim(),
        quantity,
      };
    })
    .filter(Boolean);
}

function getViewerEmail(request: NextRequest, signedInUserEmail?: string | null) {
  const queryEmail = request.nextUrl.searchParams.get('email') || '';
  return normalizeEmail(signedInUserEmail || queryEmail);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const signedInUser = await getUserFromCookie();
    const body = (await request.json()) as {
      email?: string;
      requestType?: ReturnRefundRequestType;
      reason?: string;
      details?: string;
      items?: Array<{ itemIndex?: number; quantity?: number }>;
    };
    const viewerEmail = normalizeEmail(signedInUser?.email || body.email);

    if (!viewerEmail) {
      return NextResponse.json(
        { error: 'Please provide the order email to request a return or refund.' },
        { status: 401 }
      );
    }

    const order = await Order.findOne({
      _id: id,
      'customer.email': viewerEmail,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (!ELIGIBLE_ORDER_STATUSES.has(order.status)) {
      return NextResponse.json(
        {
          error:
            'Returns and refunds can be requested after payment confirmation or once the order is in transit/delivered.',
        },
        { status: 409 }
      );
    }

    const requestType = ALLOWED_REQUEST_TYPES.includes(body.requestType as ReturnRefundRequestType)
      ? (body.requestType as ReturnRefundRequestType)
      : null;
    const reason = cleanString(body.reason, 120);
    const details = cleanString(body.details, 1200);
    const selectedItems = normalizeSelectedItems(body.items, order.items);

    if (!requestType) {
      return NextResponse.json(
        { error: 'Please choose whether this is a return, refund, or combined request.' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Please choose a reason for your request.' },
        { status: 400 }
      );
    }

    if (!details) {
      return NextResponse.json(
        { error: 'Please describe the return or refund issue in a little more detail.' },
        { status: 400 }
      );
    }

    if (!selectedItems.length) {
      return NextResponse.json(
        { error: 'Please select at least one item for the request.' },
        { status: 400 }
      );
    }

    const existingRequests = Array.isArray(order.returnRefundRequests)
      ? order.returnRefundRequests
      : [];
    const hasActiveRequest = existingRequests.some((entry: IReturnRefundRequest) =>
      ACTIVE_REQUEST_STATUSES.has(entry.status as ReturnRefundRequestStatus)
    );

    if (hasActiveRequest) {
      return NextResponse.json(
        {
          error:
            'There is already an active return or refund request for this order. Please wait for the current review to finish.',
        },
        { status: 409 }
      );
    }

    order.returnRefundRequests = [
      ...existingRequests,
      {
        requestType,
        status: 'requested',
        reason,
        details,
        customerEmail: viewerEmail,
        items: selectedItems,
        requestedAt: new Date(),
      },
    ];

    await order.save();

    return NextResponse.json(
      {
        success: true,
        message:
          'Your return/refund request has been submitted. Our team will review it shortly.',
        order: sanitizeOrderForClient(order.toObject() as Record<string, unknown>),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit return/refund request.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await adminMiddleware(request);
  if (authError) return authError;

  try {
    await dbConnect();

    const { id } = await params;
    const body = (await request.json()) as {
      requestId?: string;
      status?: ReturnRefundRequestStatus;
      adminNotes?: string;
      refundAmount?: number;
    };

    const requestId = cleanString(body.requestId, 80);
    const nextStatus = ALLOWED_REQUEST_STATUSES.includes(
      body.status as ReturnRefundRequestStatus
    )
      ? (body.status as ReturnRefundRequestStatus)
      : null;

    if (!requestId || !nextStatus) {
      return NextResponse.json(
        { error: 'Request ID and a valid status are required.' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const requestEntry = Array.isArray(order.returnRefundRequests)
      ? order.returnRefundRequests.find(
          (entry: IReturnRefundRequest & { _id?: unknown }) => String(entry._id) === requestId
        )
      : null;

    if (!requestEntry) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    requestEntry.status = nextStatus;
    requestEntry.adminNotes = cleanString(body.adminNotes, 1200) || undefined;

    const refundAmount = normalizeRefundAmount(body.refundAmount);
    requestEntry.refundAmount = refundAmount ?? undefined;
    requestEntry.reviewedAt = requestEntry.reviewedAt || new Date();

    if (nextStatus === 'rejected' || nextStatus === 'closed' || nextStatus === 'refunded') {
      requestEntry.resolvedAt = new Date();
    }

    await order.save();

    return NextResponse.json({
      success: true,
      order: sanitizeOrderForClient(order.toObject() as Record<string, unknown>),
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update return/refund request.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const signedInUser = await getUserFromCookie();
    const viewerEmail = getViewerEmail(request, signedInUser?.email);

    if (!viewerEmail) {
      return NextResponse.json(
        { error: 'Please provide the order email to view return/refund requests.' },
        { status: 401 }
      );
    }

    const order = await Order.findOne({
      _id: id,
      'customer.email': viewerEmail,
    }).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      requests: Array.isArray(order.returnRefundRequests) ? order.returnRefundRequests : [],
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load return/refund requests.' },
      { status: 500 }
    );
  }
}
