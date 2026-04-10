const TWILIO_VERIFY_BASE_URL = 'https://verify.twilio.com/v2';

function getTwilioVerifyConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

  return {
    accountSid,
    authToken,
    serviceSid,
    configured: Boolean(accountSid && authToken && serviceSid),
  };
}

export function isPhoneOtpConfigured() {
  return getTwilioVerifyConfig().configured;
}

export function normalizePhoneNumber(input: string) {
  const raw = String(input || '').trim();
  if (!raw) {
    return null;
  }

  if (raw.startsWith('+')) {
    const digits = raw.slice(1).replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      return null;
    }
    return `+${digits}`;
  }

  const digits = raw.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

function createTwilioAuthHeader(accountSid: string, authToken: string) {
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  return `Basic ${credentials}`;
}

async function twilioVerifyRequest(path: string, body: URLSearchParams) {
  const { accountSid, authToken, configured } = getTwilioVerifyConfig();
  if (!configured) {
    throw new Error('PHONE_OTP_NOT_CONFIGURED');
  }

  const response = await fetch(`${TWILIO_VERIFY_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: createTwilioAuthHeader(accountSid, authToken),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as
    | { status?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(data?.message || 'PHONE_OTP_REQUEST_FAILED');
  }

  return data;
}

export async function sendPhoneOtp(phone: string) {
  const { serviceSid, configured } = getTwilioVerifyConfig();
  if (!configured) {
    throw new Error('PHONE_OTP_NOT_CONFIGURED');
  }

  await twilioVerifyRequest(`/Services/${serviceSid}/Verifications`, new URLSearchParams({
    To: phone,
    Channel: 'sms',
  }));
}

export async function verifyPhoneOtp(phone: string, code: string) {
  const { serviceSid, configured } = getTwilioVerifyConfig();
  if (!configured) {
    throw new Error('PHONE_OTP_NOT_CONFIGURED');
  }

  const data = await twilioVerifyRequest(
    `/Services/${serviceSid}/VerificationCheck`,
    new URLSearchParams({
      To: phone,
      Code: code,
    })
  );

  if (data?.status !== 'approved') {
    throw new Error('PHONE_OTP_INVALID');
  }
}
