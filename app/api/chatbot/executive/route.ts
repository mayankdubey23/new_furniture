import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { SITE_CONTACT_EMAIL, SITE_NAME } from '@/lib/brand';
import { getAdminSettings } from '@/lib/services/adminSettings';
import { getUserFromCookie } from '@/lib/userAuth';
import ContactUs from '@/models/ContactUs';

export const dynamic = 'force-dynamic';

type ExecutiveRequestPayload = {
  phone?: string;
  reason?: string;
};

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeEmail(value: unknown) {
  const email = cleanString(value).toLowerCase();

  if (!email || !email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    return '';
  }

  return email;
}

function normalizePhone(value: unknown) {
  return cleanString(value).replace(/\D/g, '').slice(0, 10);
}

function resolveSupportSender() {
  const from =
    process.env.SUPPORT_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    '';
  const senderName = (process.env.SUPPORT_FROM_NAME || `${SITE_NAME} Support`).trim();

  if (!from) {
    return '';
  }

  if (from.includes('<')) {
    return from;
  }

  return senderName ? `${senderName} <${from}>` : from;
}

async function sendExecutiveRequestEmail({
  customerName,
  customerEmail,
  phone,
  reason,
  referenceId,
}: {
  customerName: string;
  customerEmail: string;
  phone: string;
  reason: string;
  referenceId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = resolveSupportSender();
  const adminSettings = await getAdminSettings();
  const recipients = Array.from(
    new Set(
      [
        process.env.ADMIN_EMAIL,
        adminSettings.adminProfile.email,
        SITE_CONTACT_EMAIL,
      ]
        .map((value) => normalizeEmail(value))
        .filter(Boolean)
    )
  );

  if (!apiKey || !from || !recipients.length) {
    return { sent: false, skipped: true };
  }

  const detailLines = [
    `Reference ID: ${referenceId}`,
    `Customer: ${customerName}`,
    customerEmail ? `Customer email: ${customerEmail}` : '',
    `Phone: ${phone}`,
    `Reason: ${reason}`,
  ].filter(Boolean);
  const htmlLines = detailLines
    .map((line) => `<p style="margin:8px 0;color:#5b3a29;font-size:15px;">${escapeHtml(line)}</p>`)
    .join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `Executive callback request - ${phone}`,
      text: [`New executive callback request for ${SITE_NAME}.`, '', ...detailLines].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;background:#f7f1eb;padding:28px;color:#2a211c;">
          <div style="max-width:640px;margin:0 auto;background:#fffdf9;border:1px solid rgba(110,74,51,0.14);border-radius:20px;overflow:hidden;">
            <div style="padding:24px 28px;background:#4f3528;color:#fff7ed;">
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.78;">${escapeHtml(SITE_NAME)} Support</div>
              <h1 style="margin:10px 0 0;font-size:26px;font-weight:600;">Executive callback request</h1>
            </div>
            <div style="padding:28px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">A shopper asked to speak with an executive.</p>
              <div style="padding:18px;border:1px solid rgba(110,74,51,0.12);border-radius:16px;background:#f8f1e9;">
                ${htmlLines}
              </div>
            </div>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    return { sent: false, skipped: false };
  }

  return { sent: true, skipped: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExecutiveRequestPayload;
    const phone = normalizePhone(body.phone);
    const reason = cleanString(body.reason).slice(0, 600);

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Please tell us the reason for the callback.' },
        { status: 400 }
      );
    }

    await dbConnect();
    const signedInUser = await getUserFromCookie();
    const customerName = cleanString(signedInUser?.name) || 'Chatbot Visitor';
    const customerEmail =
      normalizeEmail(signedInUser?.email) || 'callback-request@furniturelele.local';
    const created = await ContactUs.create({
      name: customerName,
      email: customerEmail,
      phone,
      subject: 'Executive callback request',
      message: `Callback requested from chatbot.\nReason: ${reason}`,
      active: true,
    });

    let emailSent = false;
    try {
      const emailResult = await sendExecutiveRequestEmail({
        customerName,
        customerEmail,
        phone,
        reason,
        referenceId: String(created._id),
      });
      emailSent = emailResult.sent;
    } catch (error) {
      console.error('Executive request email failed:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Our executive will call you shortly. Your callback details have been shared with our team by mail.',
        referenceId: created._id,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Executive callback request failed:', error);
    return NextResponse.json(
      { error: 'Failed to submit your callback request. Please try again.' },
      { status: 500 }
    );
  }
}
