'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import AnimatedHeading from '@/components/AnimatedHeading';
import { useCart } from '@/context/CartContext';
import { getApiUrl } from '@/lib/api/browser';
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY_CODE,
  INDIA_ADDRESS_DIRECTORY,
  buildCustomerAddress,
  getCountryOption,
  getIndianCityDirectory,
  getIndianStateDirectory,
} from '@/lib/addressDirectory';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  notes: string;
}

interface PaymentConfig {
  enabled: boolean;
  keyId: string | null;
}

interface GatewayPayload {
  keyId: string | null;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
}

interface CreateOrderResponse {
  orderId: string;
  trackingNumber?: string;
  requiresPayment?: boolean;
  gateway?: GatewayPayload;
  error?: string;
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error?: { description?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', callback: (payload: RazorpayFailure) => void) => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
  handler: (payload: RazorpaySuccess) => void | Promise<void>;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const initialForm: CustomerForm = {
  name: '',
  email: '',
  phone: '',
  country: DEFAULT_COUNTRY_CODE,
  state: '',
  city: '',
  pincode: '',
  addressLine1: '',
  addressLine2: '',
  notes: '',
};

type CheckoutStep = 'details' | 'payment' | 'success';
type PaymentMethod = 'cod' | 'razorpay';

function validateForm(form: CustomerForm) {
  if (!form.name.trim()) return 'Please enter your full name.';
  if (!form.email.trim()) return 'Please enter your email address.';
  if (!form.phone.trim()) return 'Please enter your phone number.';
  if (!form.addressLine1.trim()) return 'Please enter your street address.';
  if (form.country !== DEFAULT_COUNTRY_CODE) return 'Structured checkout currently supports India addresses only.';
  if (!form.state.trim()) return 'Please choose your state.';
  if (!form.city.trim()) return 'Please choose your city.';
  const cityDirectory = getIndianCityDirectory(form.state, form.city);
  if (!cityDirectory) return 'Please choose a valid city for the selected state.';
  if (!form.pincode.trim()) return 'Please enter your pincode.';
  if (!/^\d{6}$/.test(form.pincode.trim())) return 'Please enter a valid 6-digit pincode.';
  return '';
}

function SectionCard({ children }: { children: ReactNode }) {
  return <div className="section-shell rounded-[2rem] border border-theme-line/50 p-8 md:p-10">{children}</div>;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">
      {children}
    </label>
  );
}

function TextField(props: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 disabled:cursor-not-allowed disabled:bg-theme-sand/40 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30 dark:disabled:bg-white/10"
    />
  );
}

function TextAreaField(props: ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className="resize-none rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink placeholder-theme-walnut/40 outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30"
    />
  );
}

function SelectField(props: ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className="rounded-xl border border-theme-line/60 bg-white/60 px-4 py-3 text-sm text-theme-ink outline-none transition focus:border-theme-bronze focus:ring-1 focus:ring-theme-bronze/30 disabled:cursor-not-allowed disabled:bg-theme-sand/40 dark:bg-white/5 dark:text-theme-ivory dark:disabled:bg-white/10"
    />
  );
}

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState<CheckoutStep>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ enabled: false, keyId: null });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [orderId, setOrderId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [completedMethod, setCompletedMethod] = useState<PaymentMethod>('cod');
  const selectedCountry = useMemo(() => getCountryOption(form.country), [form.country]);
  const selectedStateDirectory = useMemo(() => getIndianStateDirectory(form.state), [form.state]);
  const availableCities = selectedStateDirectory?.cities ?? [];

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const response = await fetch(getApiUrl('/api/payments/razorpay/config'), { cache: 'no-store' });
        const data = (await response.json()) as PaymentConfig;
        if (!active) return;
        setPaymentConfig({ enabled: Boolean(data.enabled && data.keyId), keyId: data.keyId || null });
      } catch {
        if (!active) return;
        setPaymentConfig({ enabled: false, keyId: null });
      }
    };
    void loadConfig();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!paymentConfig.enabled && paymentMethod === 'razorpay') {
      setPaymentMethod('cod');
    }
  }, [paymentConfig.enabled, paymentMethod]);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const nextValue = name === 'pincode' ? value.replace(/\D/g, '').slice(0, 6) : value;
    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));
  }, []);

  const handleCountryChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setForm((current) => ({
      ...current,
      country: value,
      state: '',
      city: '',
      pincode: '',
    }));
  }, []);

  const handleStateChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setForm((current) => ({
      ...current,
      state: value,
      city: '',
      pincode: '',
    }));
  }, []);

  const handleCityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setForm((current) => ({
        ...current,
        city: value,
        pincode: '',
      }));
    },
    []
  );

  const payload = useMemo(
    () => ({
      items: cart.map((item) => ({
        productId: String(item.id),
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country,
        state: form.state.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        address: buildCustomerAddress(form.addressLine1, form.addressLine2),
      },
      notes: form.notes.trim(),
      paymentMethod,
    }),
    [cart, form, paymentMethod]
  );

  const deliverySummary = useMemo(
    () =>
      [
        form.addressLine1.trim(),
        form.addressLine2.trim(),
        form.city.trim(),
        form.state.trim(),
        form.pincode.trim(),
        selectedCountry?.name || '',
      ]
        .filter(Boolean)
        .join(', '),
    [form.addressLine1, form.addressLine2, form.city, form.state, form.pincode, selectedCountry]
  );

  const createOrder = useCallback(async () => {
    const response = await fetch(getApiUrl('/api/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as CreateOrderResponse;
    if (!response.ok) throw new Error(data.error || 'Failed to place order');
    return data;
  }, [payload]);

  const verifyPayment = useCallback(async (checkoutOrderId: string, payment: RazorpaySuccess) => {
    const response = await fetch(getApiUrl('/api/payments/razorpay/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: checkoutOrderId, ...payment }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(data.error || 'Payment verification failed');
  }, []);

  const handleContinue = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const validationError = validateForm(form);
      if (validationError) {
        setErrorMsg(validationError);
        return;
      }
      setErrorMsg('');
      setInfoMsg('');
      setStep('payment');
    },
    [form]
  );

  const handleCashOnDelivery = useCallback(async () => {
    setSubmitting(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const data = await createOrder();
      setOrderId(data.orderId);
      setTrackingNumber(data.trackingNumber || '');
      setCompletedMethod('cod');
      clearCart();
      setStep('success');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to place your order.');
    } finally {
      setSubmitting(false);
    }
  }, [clearCart, createOrder]);

  const handleOnlinePayment = useCallback(async () => {
    if (!paymentConfig.enabled || !paymentConfig.keyId) {
      setErrorMsg('Online payment is not available right now. Please choose Cash on Delivery.');
      return;
    }
    if (!window.Razorpay) {
      setErrorMsg('The payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const data = await createOrder();
      if (!data.requiresPayment || !data.gateway || !data.gateway.keyId) {
        throw new Error('Online payment could not be initialized.');
      }

      const instance = new window.Razorpay({
        key: data.gateway.keyId,
        amount: data.gateway.amount,
        currency: data.gateway.currency,
        name: data.gateway.name,
        description: data.gateway.description,
        order_id: data.gateway.orderId,
        prefill: data.gateway.prefill,
        theme: { color: '#a56a3f' },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setInfoMsg('Payment window closed. Your order is still waiting for payment.');
          },
        },
        handler: async (payment) => {
          try {
            await verifyPayment(data.orderId, payment);
            setOrderId(data.orderId);
            setTrackingNumber(data.trackingNumber || '');
            setCompletedMethod('razorpay');
            clearCart();
            setStep('success');
          } catch (error) {
            setErrorMsg(error instanceof Error ? error.message : 'Payment verification failed.');
          } finally {
            setSubmitting(false);
          }
        },
      });

      instance.on('payment.failed', (payload) => {
        setSubmitting(false);
        setErrorMsg(payload.error?.description || 'Payment failed. Please try again.');
      });

      instance.open();
    } catch (error) {
      setSubmitting(false);
      setErrorMsg(error instanceof Error ? error.message : 'Unable to start online payment.');
    }
  }, [clearCart, createOrder, paymentConfig.enabled, paymentConfig.keyId, verifyPayment]);

  const handlePlaceOrder = useCallback(async () => {
    const validationError = validateForm(form);
    if (validationError) {
      setErrorMsg(validationError);
      setStep('details');
      return;
    }
    if (paymentMethod === 'razorpay') {
      await handleOnlinePayment();
      return;
    }
    await handleCashOnDelivery();
  }, [form, handleCashOnDelivery, handleOnlinePayment, paymentMethod]);

  if (totalItems === 0 && step !== 'success') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-20 text-theme-ivory backdrop-blur-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Checkout</p>
            <AnimatedHeading as="h1" className="mb-6 font-display text-5xl text-theme-ivory">Your cart is empty</AnimatedHeading>
            <Link href="/#collections" className="inline-block rounded-full bg-theme-bronze px-10 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white transition-all hover:bg-theme-ink">Browse Collection</Link>
          </div>
        </div>
      </main>
    );
  }

  if (step === 'success') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="section-shell rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.34)] px-8 py-20 text-theme-ivory shadow-2xl backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Order Confirmed</p>
            <AnimatedHeading as="h1" className="mt-4 font-display text-5xl text-theme-ivory">Thank you!</AnimatedHeading>
            <p className="mt-4 text-lg text-theme-ivory/70">
              {completedMethod === 'razorpay'
                ? 'Your order is confirmed and the payment has been completed online.'
                : 'Your order is confirmed. Our team will contact you for delivery and payment details.'}
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze">Order Reference</p>
              <p className="mt-1 break-all font-mono text-sm text-theme-ivory/80">{orderId}</p>
              {trackingNumber ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-theme-bronze">Tracking Number</p>
                  <p className="mt-1 break-all font-mono text-sm text-theme-ivory/80">{trackingNumber}</p>
                </>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-theme-ivory/50">Payment mode: {completedMethod === 'razorpay' ? 'Online payment' : 'Cash on Delivery'}</p>
            <p className="mt-2 text-sm text-theme-ivory/55">
              Shipping updates will be sent to {form.email || 'your checkout email'} and will also appear in website notifications when you sign in with the same email.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href={`/track-order?orderId=${encodeURIComponent(orderId)}`} className="rounded-full bg-theme-bronze px-8 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white transition-all hover:bg-theme-ink">Track Order</Link>
              <Link href="/" className="rounded-full border border-theme-line/50 px-8 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-theme-ivory/70 transition-all hover:border-theme-bronze hover:text-theme-bronze">Back to Home</Link>
              <Link href="/contact" className="rounded-full border border-theme-line/50 px-8 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-theme-ivory/70 transition-all hover:border-theme-bronze hover:text-theme-bronze">Contact Us</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-6 pb-20 pt-32 md:px-10 lg:px-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">Checkout</p>
          <AnimatedHeading as="h1" className="mt-3 font-display text-5xl text-theme-ink dark:text-theme-ivory md:text-6xl">Complete Your Order</AnimatedHeading>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/64">
            Country defaults to India, then state unlocks the matching city list and you enter the delivery pincode yourself.
          </p>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {[
            ['Step 1', 'Address Details', 'Choose country, state, city, then enter the delivery pincode and address details manually.'],
            ['Step 2', 'Payment Option', 'Payment options appear only after the delivery details are valid.'],
          ].map(([eyebrow, title, copy], index) => (
            <div key={title} className={`rounded-[1.6rem] border p-5 ${step === (index === 0 ? 'details' : 'payment') ? 'border-theme-bronze bg-theme-bronze/8' : 'border-theme-line/50 bg-white/55 dark:bg-white/5'}`}>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-theme-bronze">{eyebrow}</p>
              <h2 className="mt-2 text-lg font-semibold text-theme-ink dark:text-theme-ivory">{title}</h2>
              <p className="mt-2 text-sm text-theme-walnut/65 dark:text-theme-ivory/60">{copy}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            {step === 'details' ? (
              <form onSubmit={handleContinue} className="space-y-6">
                <SectionCard>
                  <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-theme-bronze">Delivery Details</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5 sm:col-span-2"><FieldLabel>Full Name *</FieldLabel><TextField name="name" value={form.name} onChange={handleTextChange} required placeholder="Your full name" /></div>
                    <div className="flex flex-col gap-1.5"><FieldLabel>Email *</FieldLabel><TextField name="email" type="email" value={form.email} onChange={handleTextChange} required placeholder="you@email.com" /></div>
                    <div className="flex flex-col gap-1.5"><FieldLabel>Phone *</FieldLabel><TextField name="phone" type="tel" value={form.phone} onChange={handleTextChange} required placeholder="+91 98765 43210" /></div>
                    <div className="flex flex-col gap-1.5"><FieldLabel>Country / Region *</FieldLabel><SelectField name="country" value={form.country} onChange={handleCountryChange} required>{COUNTRY_OPTIONS.map((country) => (<option key={country.code} value={country.code}>{country.flag} {country.name}</option>))}</SelectField></div>
                    <div className="flex flex-col gap-1.5"><FieldLabel>State *</FieldLabel><SelectField name="state" value={form.state} onChange={handleStateChange} required><option value="">Choose state</option>{INDIA_ADDRESS_DIRECTORY.map((state) => (<option key={state.code} value={state.name}>{state.name}</option>))}</SelectField></div>
                    <div className="flex flex-col gap-1.5"><FieldLabel>City *</FieldLabel><SelectField name="city" value={form.city} onChange={handleCityChange} required disabled={!selectedStateDirectory}><option value="">{selectedStateDirectory ? 'Choose city' : 'Choose state first'}</option>{availableCities.map((city) => (<option key={city.name} value={city.name}>{city.name}</option>))}</SelectField></div>
                    <div className="flex flex-col gap-1.5"><FieldLabel>Pincode *</FieldLabel><TextField name="pincode" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={form.pincode} onChange={handleTextChange} required placeholder={form.city ? 'Enter 6-digit pincode' : 'Choose city first'} disabled={!form.city} /></div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2"><FieldLabel>Address Line 1 *</FieldLabel><TextField name="addressLine1" value={form.addressLine1} onChange={handleTextChange} required placeholder="Street address, area, house number" /></div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2"><FieldLabel>Address Line 2</FieldLabel><TextField name="addressLine2" value={form.addressLine2} onChange={handleTextChange} placeholder="Apartment, suite, landmark, building" /></div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2"><FieldLabel>Special Notes</FieldLabel><TextAreaField name="notes" value={form.notes} onChange={handleTextChange} rows={3} placeholder="Delivery notes or any request you want us to know." /></div>
                  </div>
                </SectionCard>
                {errorMsg ? <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">{errorMsg}</div> : null}
                <button type="submit" className="w-full rounded-full bg-theme-ink py-4 text-sm font-bold uppercase tracking-[0.28em] text-white transition-all hover:scale-[1.01] active:scale-95 dark:bg-white dark:text-[var(--theme-contrast-ink)]">Continue to Payment</button>
              </form>
            ) : (
              <>
                <SectionCard>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-theme-bronze">Confirm Delivery Address</h2>
                      <p className="mt-4 text-lg font-semibold text-theme-ink dark:text-theme-ivory">{form.name}</p>
                      <p className="mt-2 text-sm leading-7 text-theme-walnut/70 dark:text-theme-ivory/60">{deliverySummary}</p>
                      <p className="mt-1 text-sm text-theme-walnut/60 dark:text-theme-ivory/55">{form.email} | {form.phone}</p>
                      {selectedCountry ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-theme-bronze">{selectedCountry.flag} {selectedCountry.name}</p> : null}
                    </div>
                    <button type="button" onClick={() => { setErrorMsg(''); setInfoMsg(''); setStep('details'); }} className="rounded-full border border-theme-line/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut transition-colors hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70">Edit Address</button>
                  </div>
                </SectionCard>
                <SectionCard>
                  <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-theme-bronze">Choose Payment Option</h2>
                  <div className="grid gap-4">
                    <button type="button" onClick={() => setPaymentMethod('cod')} className={`rounded-[1.6rem] border px-5 py-5 text-left transition-all ${paymentMethod === 'cod' ? 'border-theme-bronze bg-theme-bronze/10' : 'border-theme-line/60 bg-white/40 hover:border-theme-bronze/60 dark:bg-white/5'}`}>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-bronze">Cash on Delivery</p>
                      <p className="mt-2 text-sm text-theme-walnut/68 dark:text-theme-ivory/60">Place the order now and pay when your delivery arrives.</p>
                    </button>
                    <button type="button" onClick={() => paymentConfig.enabled && setPaymentMethod('razorpay')} disabled={!paymentConfig.enabled} className={`rounded-[1.6rem] border px-5 py-5 text-left transition-all ${paymentMethod === 'razorpay' ? 'border-theme-bronze bg-theme-bronze/10' : 'border-theme-line/60 bg-white/40 hover:border-theme-bronze/60 dark:bg-white/5'} ${!paymentConfig.enabled ? 'cursor-not-allowed opacity-60' : ''}`}>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-theme-bronze">Online Payment</p>
                      <p className="mt-2 text-sm text-theme-walnut/68 dark:text-theme-ivory/60">Pay securely with Razorpay using UPI, cards, net banking, or wallets.</p>
                      {!paymentConfig.enabled ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut/55 dark:text-theme-ivory/50">Online payments are currently unavailable.</p> : null}
                    </button>
                  </div>
                </SectionCard>
                {errorMsg ? <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">{errorMsg}</div> : null}
                {infoMsg ? <div className="rounded-xl border border-theme-bronze/20 bg-theme-bronze/10 px-5 py-4 text-sm text-theme-walnut dark:text-theme-ivory/75">{infoMsg}</div> : null}
                <button type="button" onClick={() => void handlePlaceOrder()} disabled={submitting} className="w-full rounded-full bg-theme-ink py-4 text-sm font-bold uppercase tracking-[0.28em] text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)]">
                  {submitting ? (paymentMethod === 'razorpay' ? 'Opening Payment Gateway...' : 'Placing Order...') : (paymentMethod === 'razorpay' ? `Pay Securely · Rs. ${totalPrice.toLocaleString('en-IN')}` : `Place Order · Rs. ${totalPrice.toLocaleString('en-IN')}`)}
                </button>
              </>
            )}
          </div>

          <div className="premium-surface sticky top-32 self-start rounded-[2rem] border border-white/5 p-8 shadow-2xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-theme-bronze">Order Summary</p>
            <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-theme-line/40 bg-white/30 p-3 dark:bg-black/20">

                  <img src={item.image} alt={item.name} className="h-16 w-16 flex-shrink-0 rounded-xl object-cover shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-theme-ink dark:text-white">{item.name}</p>
                    <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/50">Qty: {item.quantity}</p>
                  </div>
                  <p className="flex-shrink-0 text-sm font-bold text-theme-bronze">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-theme-line/40 pt-6 text-sm">
              <div className="flex justify-between"><span className="text-theme-walnut/70 dark:text-theme-ivory/60">Subtotal ({totalItems} items)</span><span className="font-semibold text-theme-ink dark:text-white">Rs. {totalPrice.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-theme-walnut/70 dark:text-theme-ivory/60">Delivery</span><span className="text-xs font-bold uppercase tracking-wider text-theme-olive">Free</span></div>
              <div className="flex justify-between border-t border-theme-line/40 pt-3 text-lg font-display"><span className="text-theme-ink dark:text-white">Total</span><span className="text-theme-bronze">Rs. {totalPrice.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="mt-6 space-y-3">
              <Link href="/cart" className="block w-full rounded-full border border-theme-line/50 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-theme-walnut transition-all hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70 dark:hover:text-theme-bronze">Back to Cart</Link>
              <Link href="/customization" className="block w-full rounded-full border border-theme-line/50 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-theme-walnut transition-all hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/70 dark:hover:text-theme-bronze">Customize Instead</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
