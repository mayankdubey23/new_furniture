import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { getUserFromCookie } from '@/lib/userAuth';
import { saveSupportUpload } from '@/lib/server/uploadStorage';
import ChatbotTicket from '@/models/ChatbotTicket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ISSUE_TYPES = new Set([
  'Order issue',
  'Product damage',
  'Customization help',
  'Delivery concern',
  'Payment problem',
  'Website issue',
  'Other',
]);
const URGENCY_LEVELS = new Set(['Low', 'Normal', 'Urgent']);
const CONTACT_METHODS = new Set(['Phone call', 'WhatsApp', 'Email']);

function cleanString(value: unknown, maxLength = 400) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function cleanEmail(value: unknown) {
  const email = cleanString(value, 160).toLowerCase();

  if (!email || !email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    return '';
  }

  return email;
}

function cleanPhone(value: unknown) {
  return cleanString(value, 32).replace(/\D/g, '').slice(0, 10);
}

function fileSizeMb(file: File) {
  return file.size / 1024 / 1024;
}

async function saveOptionalAttachment({
  file,
  ticketLabel,
  kind,
}: {
  file: FormDataEntryValue | null;
  ticketLabel: string;
  kind: 'image' | 'audio';
}) {
  if (!(file instanceof File) || file.size <= 0) {
    return null;
  }

  const maxMb = kind === 'audio' ? 8 : 5;

  if (fileSizeMb(file) > maxMb) {
    throw new Error(
      kind === 'audio'
        ? 'Voice note must be 8MB or smaller.'
        : 'Problem image must be 5MB or smaller.'
    );
  }

  const result = await saveSupportUpload({
    file,
    ticketLabel,
    kind,
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  return {
    kind,
    url: result.path,
    filename: file.name || `${kind}-attachment`,
    contentType: file.type || '',
    size: file.size,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signedInUser = await getUserFromCookie();
    const issueTypeInput = cleanString(formData.get('issueType'), 80);
    const issueType = ISSUE_TYPES.has(issueTypeInput) ? issueTypeInput : 'Other';
    const urgencyInput = cleanString(formData.get('urgency'), 40);
    const urgency = URGENCY_LEVELS.has(urgencyInput) ? urgencyInput : 'Normal';
    const preferredContactInput = cleanString(formData.get('preferredContact'), 40);
    const preferredContact = CONTACT_METHODS.has(preferredContactInput)
      ? preferredContactInput
      : 'Phone call';
    const customerName =
      cleanString(formData.get('customerName'), 80) ||
      cleanString(signedInUser?.name, 80) ||
      'Chatbot Visitor';
    const customerEmail =
      cleanEmail(formData.get('customerEmail')) || cleanEmail(signedInUser?.email);
    const customerPhone = cleanPhone(formData.get('customerPhone'));
    const description = cleanString(formData.get('description'), 1200);
    const orderOrProductRef = cleanString(formData.get('orderOrProductRef'), 120);
    const roomOrProduct = cleanString(formData.get('roomOrProduct'), 160);
    const triedAlready = cleanString(formData.get('triedAlready'), 500);
    const bestTimeToCall = cleanString(formData.get('bestTimeToCall'), 100);

    if (!/^\d{10}$/.test(customerPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Please describe the problem you are facing.' },
        { status: 400 }
      );
    }

    await dbConnect();
    const ticketLabel = `${issueType}-${customerPhone}`;
    const attachments = (
      await Promise.all([
        saveOptionalAttachment({
          file: formData.get('image'),
          ticketLabel,
          kind: 'image',
        }),
        saveOptionalAttachment({
          file: formData.get('voice'),
          ticketLabel,
          kind: 'audio',
        }),
      ])
    ).filter(Boolean);

    const ticket = await ChatbotTicket.create({
      customerName,
      customerEmail,
      customerPhone,
      issueType,
      urgency,
      preferredContact,
      orderOrProductRef,
      description,
      answers: {
        roomOrProduct,
        triedAlready,
        bestTimeToCall,
      },
      attachments,
      status: 'open',
      source: 'chatbot',
      active: true,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Thanks, I have shared your problem with our support team. Our executive will review the details and contact you shortly.',
        ticketId: ticket._id,
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit your support request.',
      },
      { status: 500 }
    );
  }
}
