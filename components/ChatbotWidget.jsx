'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  PhoneCall,
  Send,
  Sparkles,
  Mic,
  Square,
  X,
} from 'lucide-react';
import { SITE_NAME } from '@/lib/brand';
import { isAdminPortalPath } from '@/lib/adminPortal';

const CATALOG_QUICK_REPLIES = [
  'Show sofas',
  'Show chairs',
  'Show recliners',
  'Show pouffes',
];
const DEFAULT_QUICK_REPLIES = [
  ...CATALOG_QUICK_REPLIES,
  'Customize a product',
  'Report a problem',
  'Talk to executive',
];
const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    'Hi, I can help you choose furniture, compare prices, start customization, or track an order.',
  quickReplies: DEFAULT_QUICK_REPLIES,
};
const STORAGE_KEY = 'furniture-chatbot-messages-v3';
const SUPPORT_ISSUE_TYPES = [
  'Order issue',
  'Product damage',
  'Customization help',
  'Delivery concern',
  'Payment problem',
  'Website issue',
  'Other',
];
const SUPPORT_URGENCY_LEVELS = ['Normal', 'Urgent', 'Low'];
const SUPPORT_CONTACT_METHODS = ['Phone call', 'WhatsApp', 'Email'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function createUserMessage(content) {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content,
  };
}

function createAssistantMessage(data) {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: data.message,
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : [],
    action: data.action,
  };
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showExecutiveForm, setShowExecutiveForm] = useState(false);
  const [executiveForm, setExecutiveForm] = useState({ phone: '', reason: '' });
  const [executiveError, setExecutiveError] = useState('');
  const [isSubmittingExecutive, setIsSubmittingExecutive] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportForm, setSupportForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    issueType: 'Order issue',
    urgency: 'Normal',
    preferredContact: 'Phone call',
    orderOrProductRef: '',
    roomOrProduct: '',
    triedAlready: '',
    bestTimeToCall: '',
    description: '',
  });
  const [supportImage, setSupportImage] = useState(null);
  const [supportVoice, setSupportVoice] = useState(null);
  const [supportError, setSupportError] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const discardRecordingRef = useRef(false);
  const pathname = usePathname();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const composerImageInputRef = useRef(null);
  const isAdminRoute = isAdminPortalPath(pathname);

  useEffect(() => {
    try {
      const savedMessages = window.localStorage.getItem(STORAGE_KEY);
      setMessages(savedMessages ? JSON.parse(savedMessages) : [{ ...INITIAL_MESSAGE, id: crypto.randomUUID() }]);
    } catch {
      setMessages([{ ...INITIAL_MESSAGE, id: crypto.randomUUID() }]);
    }
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-12))
      );
    } catch {

    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;

    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        discardRecordingRef.current = true;
        recorderRef.current.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const latestQuickReplies = useMemo(() => {
    const latestAssistantMessage = messages
      .slice()
      .reverse()
      .find((message) => message.role === 'assistant' && message.quickReplies?.length);

    return latestAssistantMessage?.quickReplies || INITIAL_MESSAGE.quickReplies;
  }, [messages]);

  const hasComposerAttachments = Boolean(supportImage || supportVoice);

  const openSupportForm = (
    userMessage = '',
    assistantMessage = 'I can collect the exact problem for our admin team. Choose the issue type, add details, and attach an image or voice note if it helps.'
  ) => {
    const trimmedMessage = userMessage.trim();

    setShowSupportForm(true);
    setShowExecutiveForm(false);
    setSupportError('');

    if (trimmedMessage) {
      setSupportForm((current) => ({
        ...current,
        description: current.description.trim() || trimmedMessage.slice(0, 1200),
      }));
    }

    setMessages((current) => [
      ...current,
      ...(trimmedMessage ? [createUserMessage(trimmedMessage)] : []),
      createAssistantMessage({
        message: assistantMessage,
        quickReplies: [...CATALOG_QUICK_REPLIES, 'Talk to executive'],
      }),
    ]);
    setInput('');
  };

  const sendMessage = async (messageText) => {
    const content = messageText.trim();

    if ((!content && !hasComposerAttachments) || isSending || isRecording) return;

    if (hasComposerAttachments) {
      openSupportForm(
        content,
        'I have kept your attachment ready. Add the remaining details in the support card so our team can review the image or voice note and contact you quickly.'
      );
      return;
    }

    if (/problem|issue|complaint|damage|voice|image|photo|attach|upload|support/i.test(content)) {
      openSupportForm(content);
      return;
    }

    if (/executive|agent|callback|call me|talk to/i.test(content)) {
      setShowExecutiveForm(true);
      setExecutiveError('');
      setMessages((current) => [
        ...current,
        createUserMessage(content),
        createAssistantMessage({
          message: 'Sure. Share your phone number and the reason for the call, and our executive will call you shortly.',
          quickReplies: [...CATALOG_QUICK_REPLIES, 'Track my order'],
        }),
      ]);
      setInput('');
      return;
    }

    const userMessage = createUserMessage(content);
    setInput('');
    setMessages((current) => [...current, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });
      const data = await response.json();

      setMessages((current) => [...current, createAssistantMessage(data)]);
    } catch {
      setMessages((current) => [
        ...current,
        createAssistantMessage({
          message: 'I could not reach the store assistant right now. Please try again in a moment.',
          quickReplies: [...CATALOG_QUICK_REPLIES, 'Talk to executive'],
        }),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const resetChat = () => {
    setMessages([{ ...INITIAL_MESSAGE, id: crypto.randomUUID() }]);
    setInput('');
    setShowExecutiveForm(false);
    setShowSupportForm(false);
    setExecutiveForm({ phone: '', reason: '' });
    setExecutiveError('');
    setSupportError('');
    setSupportImage(null);
    setSupportVoice(null);

    if (isRecording) {
      stopRecording({ discard: true });
    }
  };

  const openExecutiveForm = () => {
    setShowExecutiveForm(true);
    setExecutiveError('');
    setMessages((current) => [
      ...current,
      createAssistantMessage({
        message: 'Share your phone number and the reason for the call. Our executive will call you shortly.',
        quickReplies: [...CATALOG_QUICK_REPLIES, 'Track my order'],
      }),
    ]);
  };

  const setSupportField = (field, value) => {
    setSupportForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const stopRecording = ({ discard = false } = {}) => {
    discardRecordingRef.current = discard;

    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    setSupportError('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setSupportError('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      discardRecordingRef.current = false;
      streamRef.current = stream;
      recorderRef.current = recorder;
      setSupportVoice(null);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (!discardRecordingRef.current) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          setSupportVoice(new File([blob], `voice-note-${Date.now()}.webm`, { type: blob.type }));
        }

        discardRecordingRef.current = false;
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setSupportError('Microphone permission was blocked. You can still submit text and image details.');
      setIsRecording(false);
    }
  };

  const handleComposerImageSelect = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    setSupportImage(file);
    openSupportForm(
      '',
      'Image attached. Add a short description and your contact details in the support card so our team can review it properly.'
    );
    event.target.value = '';
  };

  const clearSupportImage = () => {
    setSupportImage(null);
  };

  const clearSupportVoice = () => {
    if (isRecording) {
      stopRecording({ discard: true });
      return;
    }

    setSupportVoice(null);
  };

  const toggleComposerRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    openSupportForm(
      '',
      'Voice recording started. Tap the mic again to stop, then complete the support card so our team can follow up with you.'
    );
    await startRecording();
  };

  const submitSupportTicket = async (event) => {
    event.preventDefault();
    const phone = supportForm.customerPhone.replace(/\D/g, '').slice(0, 10);

    if (!/^\d{10}$/.test(phone)) {
      setSupportError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!supportForm.description.trim()) {
      setSupportError('Please describe the problem so admin can understand it clearly.');
      return;
    }

    setSupportError('');
    setIsSubmittingSupport(true);

    try {
      const formData = new FormData();
      Object.entries({
        ...supportForm,
        customerPhone: phone,
      }).forEach(([key, value]) => {
        formData.append(key, String(value || ''));
      });

      if (supportImage) {
        formData.append('image', supportImage);
      }

      if (supportVoice) {
        formData.append('voice', supportVoice);
      }

      const response = await fetch('/api/chatbot/tickets', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support request.');
      }

      setMessages((current) => [
        ...current,
        createAssistantMessage({
          message:
            data.message ||
            'Thanks, I have shared your problem with our support team. Our executive will contact you shortly.',
          quickReplies: DEFAULT_QUICK_REPLIES,
        }),
      ]);
      setShowSupportForm(false);
      setSupportForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        issueType: 'Order issue',
        urgency: 'Normal',
        preferredContact: 'Phone call',
        orderOrProductRef: '',
        roomOrProduct: '',
        triedAlready: '',
        bestTimeToCall: '',
        description: '',
      });
      setSupportImage(null);
      setSupportVoice(null);
    } catch (error) {
      setSupportError(
        error instanceof Error ? error.message : 'Failed to submit support request.'
      );
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  const submitExecutiveRequest = async (event) => {
    event.preventDefault();
    const phone = executiveForm.phone.replace(/\D/g, '').slice(0, 10);
    const reason = executiveForm.reason.trim();

    if (!/^\d{10}$/.test(phone)) {
      setExecutiveError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!reason) {
      setExecutiveError('Please tell us the reason for the callback.');
      return;
    }

    setExecutiveError('');
    setIsSubmittingExecutive(true);

    try {
      const response = await fetch('/api/chatbot/executive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, reason }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit callback request.');
      }

      setMessages((current) => [
        ...current,
        createAssistantMessage({
          message: data.message || 'Our executive will call you shortly. Your details have been shared with our team by mail.',
          quickReplies: DEFAULT_QUICK_REPLIES,
        }),
      ]);
      setShowExecutiveForm(false);
      setExecutiveForm({ phone: '', reason: '' });
    } catch (error) {
      setExecutiveError(
        error instanceof Error
          ? error.message
          : 'Failed to submit callback request. Please try again.'
      );
    } finally {
      setIsSubmittingExecutive(false);
    }
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-5 sm:right-5">
      {open ? (
        <section
          aria-label={`${SITE_NAME} shopping assistant`}
          className="flex h-[min(39rem,calc(100vh-2rem))] w-[min(calc(100vw-2rem),24rem)] flex-col overflow-hidden rounded-2xl border border-theme-line bg-[rgba(251,247,241,0.97)] shadow-[0_24px_80px_rgba(18,14,11,0.24)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(34,27,23,0.97)]"
        >
          <header className="flex items-center justify-between border-b border-theme-line/70 px-4 py-3 dark:border-white/10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-bronze text-white shadow-[0_10px_28px_rgba(165,106,63,0.28)]">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-theme-ink dark:text-theme-ivory">
                  Store Assistant
                </p>
                <p className="truncate text-xs text-theme-walnut/62 dark:text-theme-ivory/58">
                  Products, orders, customization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="flex h-9 w-9 items-center justify-center rounded-full text-theme-walnut/70 transition-colors hover:bg-theme-sand/35 hover:text-theme-ink dark:text-theme-ivory/70 dark:hover:bg-white/8"
                title="Reset chat"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={openExecutiveForm}
                className="flex h-9 w-9 items-center justify-center rounded-full text-theme-walnut/70 transition-colors hover:bg-theme-sand/35 hover:text-theme-ink dark:text-theme-ivory/70 dark:hover:bg-white/8"
                title="Connect to executive"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => openSupportForm()}
                className="flex h-9 w-9 items-center justify-center rounded-full text-theme-walnut/70 transition-colors hover:bg-theme-sand/35 hover:text-theme-ink dark:text-theme-ivory/70 dark:hover:bg-white/8"
                title="Report problem"
              >
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-theme-walnut/70 transition-colors hover:bg-theme-sand/35 hover:text-theme-ink dark:text-theme-ivory/70 dark:hover:bg-white/8"
                title="Close chat"
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" data-lenis-prevent>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-theme-bronze text-white'
                      : 'border border-theme-line/70 bg-white/72 text-theme-walnut shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-theme-ivory'
                  }`}
                >
                  <p>{message.content}</p>

                  {message.action ? (
                    <Link
                      href={message.action.href}
                      onClick={() => setOpen(false)}
                      className="mt-3 inline-flex items-center rounded-full bg-theme-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-theme-bronze dark:bg-theme-bronze dark:hover:bg-theme-olive"
                    >
                      {message.action.label}
                    </Link>
                  ) : null}

                  {message.suggestions?.length ? (
                    <div className="mt-3 grid gap-2">
                      {message.suggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={product.href}
                          onClick={() => setOpen(false)}
                          className="grid grid-cols-[3.5rem_1fr] gap-3 rounded-xl border border-theme-line/70 bg-theme-mist/80 p-2 transition-colors hover:border-theme-bronze dark:border-white/10 dark:bg-black/12"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-theme-ink dark:text-theme-ivory">
                              {product.name}
                            </span>
                            <span className="mt-0.5 block text-xs font-semibold text-theme-bronze">
                              {formatCurrency(product.price)}
                            </span>
                            {product.colors?.length ? (
                              <span className="mt-1 block truncate text-[11px] text-theme-walnut/58 dark:text-theme-ivory/52">
                                {product.colors.join(', ')}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-theme-line/70 bg-white/72 px-3.5 py-3 text-sm text-theme-walnut/70 dark:border-white/10 dark:bg-white/8 dark:text-theme-ivory/70">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Thinking
                </div>
              </div>
            ) : null}

            {showSupportForm ? (
              <form
                onSubmit={submitSupportTicket}
                className="rounded-2xl border border-theme-line/70 bg-white/76 p-3 shadow-sm dark:border-white/10 dark:bg-white/8"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-theme-ink dark:text-theme-ivory">
                  <ImageIcon className="h-4 w-4 text-theme-bronze" aria-hidden="true" />
                  Consumer problem details
                </div>
                <p className="mt-1 text-xs leading-5 text-theme-walnut/62 dark:text-theme-ivory/60">
                  Add a clear description. Image and voice note are optional.
                </p>

                <div className="mt-3 grid gap-3">
                  <div>
                    <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-theme-bronze">
                      Problem type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUPPORT_ISSUE_TYPES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSupportField('issueType', item)}
                          className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition ${
                            supportForm.issueType === item
                              ? 'border-theme-bronze bg-theme-bronze text-white'
                              : 'border-theme-line bg-theme-mist/70 text-theme-walnut hover:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory/72'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={supportForm.customerName}
                      onChange={(event) => setSupportField('customerName', event.target.value)}
                      placeholder="Your name"
                      className="min-h-11 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                    />
                    <input
                      type="email"
                      value={supportForm.customerEmail}
                      onChange={(event) => setSupportField('customerEmail', event.target.value)}
                      placeholder="Email optional"
                      className="min-h-11 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={supportForm.customerPhone}
                      onChange={(event) =>
                        setSupportField(
                          'customerPhone',
                          event.target.value.replace(/\D/g, '').slice(0, 10)
                        )
                      }
                      placeholder="10-digit phone"
                      className="min-h-11 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                    />
                    <input
                      value={supportForm.orderOrProductRef}
                      onChange={(event) => setSupportField('orderOrProductRef', event.target.value)}
                      placeholder="Order ID / product name"
                      className="min-h-11 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                    />
                  </div>

                  <input
                    value={supportForm.roomOrProduct}
                    onChange={(event) => setSupportField('roomOrProduct', event.target.value)}
                    placeholder="Where is the issue? Product, room, page, or checkout step"
                    className="min-h-11 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                  />

                  <textarea
                    rows={3}
                    value={supportForm.description}
                    onChange={(event) => setSupportField('description', event.target.value)}
                    placeholder="Describe the problem clearly"
                    className="min-h-24 resize-none rounded-xl border border-theme-line bg-theme-mist/80 px-3 py-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                  />

                  <textarea
                    rows={2}
                    value={supportForm.triedAlready}
                    onChange={(event) => setSupportField('triedAlready', event.target.value)}
                    placeholder="What have you tried already? Optional"
                    className="min-h-20 resize-none rounded-xl border border-theme-line bg-theme-mist/80 px-3 py-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                  />

                  <div>
                    <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-theme-bronze">
                      Urgency
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPPORT_URGENCY_LEVELS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSupportField('urgency', item)}
                          className={`rounded-full border px-2 py-2 text-[11px] font-semibold transition ${
                            supportForm.urgency === item
                              ? 'border-theme-bronze bg-theme-bronze text-white'
                              : 'border-theme-line bg-theme-mist/70 text-theme-walnut dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory/72'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-theme-bronze">
                      Contact by
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPPORT_CONTACT_METHODS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSupportField('preferredContact', item)}
                          className={`rounded-full border px-2 py-2 text-[11px] font-semibold transition ${
                            supportForm.preferredContact === item
                              ? 'border-theme-bronze bg-theme-bronze text-white'
                              : 'border-theme-line bg-theme-mist/70 text-theme-walnut dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory/72'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    value={supportForm.bestTimeToCall}
                    onChange={(event) => setSupportField('bestTimeToCall', event.target.value)}
                    placeholder="Best time to contact"
                    className="min-h-11 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-sm text-theme-ink outline-none focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory"
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-xs font-semibold text-theme-walnut transition hover:border-theme-bronze hover:text-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory/72">
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      {supportImage ? 'Image attached' : 'Attach image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(event) => setSupportImage(event.target.files?.[0] || null)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${
                        isRecording
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-theme-line bg-theme-mist/80 text-theme-walnut hover:border-theme-bronze hover:text-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory/72'
                      }`}
                    >
                      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isRecording ? 'Stop voice' : supportVoice ? 'Voice attached' : 'Record voice'}
                    </button>
                  </div>
                </div>

                {supportError ? (
                  <p className="mt-2 text-xs font-semibold text-red-500">{supportError}</p>
                ) : null}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingSupport}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-theme-bronze px-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-theme-ink disabled:cursor-not-allowed disabled:opacity-55 dark:hover:bg-theme-olive"
                  >
                    {isSubmittingSupport ? 'Sending' : 'Send to admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSupportForm(false);
                      setSupportError('');
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-theme-line px-4 text-xs font-bold uppercase tracking-[0.16em] text-theme-walnut transition-colors hover:border-theme-bronze hover:text-theme-bronze dark:border-white/10 dark:text-theme-ivory/72"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {showExecutiveForm ? (
              <form
                onSubmit={submitExecutiveRequest}
                className="rounded-2xl border border-theme-line/70 bg-white/76 p-3 shadow-sm dark:border-white/10 dark:bg-white/8"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-theme-ink dark:text-theme-ivory">
                  <PhoneCall className="h-4 w-4 text-theme-bronze" aria-hidden="true" />
                  Connect to executive
                </div>
                <div className="mt-3 grid gap-2">
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={executiveForm.phone}
                    onChange={(event) =>
                      setExecutiveForm((current) => ({
                        ...current,
                        phone: event.target.value.replace(/\D/g, '').slice(0, 10),
                      }))
                    }
                    placeholder="10-digit phone number"
                    className="min-h-11 rounded-xl border border-theme-line bg-theme-mist/80 px-3 text-sm text-theme-ink outline-none transition-colors placeholder:text-theme-walnut/45 focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory dark:placeholder:text-theme-ivory/42"
                  />
                  <textarea
                    rows={3}
                    value={executiveForm.reason}
                    onChange={(event) =>
                      setExecutiveForm((current) => ({
                        ...current,
                        reason: event.target.value.slice(0, 600),
                      }))
                    }
                    placeholder="Reason for callback"
                    className="min-h-24 resize-none rounded-xl border border-theme-line bg-theme-mist/80 px-3 py-3 text-sm text-theme-ink outline-none transition-colors placeholder:text-theme-walnut/45 focus:border-theme-bronze dark:border-white/10 dark:bg-black/12 dark:text-theme-ivory dark:placeholder:text-theme-ivory/42"
                  />
                </div>
                {executiveError ? (
                  <p className="mt-2 text-xs font-semibold text-red-500">{executiveError}</p>
                ) : null}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingExecutive}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-theme-bronze px-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-theme-ink disabled:cursor-not-allowed disabled:opacity-55 dark:hover:bg-theme-olive"
                  >
                    {isSubmittingExecutive ? 'Sending' : 'Request call'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExecutiveForm(false)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-theme-line px-4 text-xs font-bold uppercase tracking-[0.16em] text-theme-walnut transition-colors hover:border-theme-bronze hover:text-theme-bronze dark:border-white/10 dark:text-theme-ivory/72"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-theme-line/70 p-3 dark:border-white/10">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1" data-lenis-prevent>
              {latestQuickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => sendMessage(reply)}
                  disabled={isSending || isRecording}
                  className="shrink-0 rounded-full border border-theme-line/70 px-3 py-2 text-xs font-semibold text-theme-walnut transition-colors hover:border-theme-bronze hover:text-theme-bronze disabled:opacity-50 dark:border-white/10 dark:text-theme-ivory/78"
                >
                  {reply}
                </button>
              ))}
            </div>
            {hasComposerAttachments || isRecording ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {supportImage ? (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-theme-line/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-theme-walnut dark:border-white/10 dark:bg-white/8 dark:text-theme-ivory/78">
                    <ImageIcon className="h-3.5 w-3.5 shrink-0 text-theme-bronze" aria-hidden="true" />
                    <span className="max-w-[8.75rem] truncate">
                      {supportImage.name || 'Image ready'}
                    </span>
                    <button
                      type="button"
                      onClick={clearSupportImage}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-theme-walnut/58 transition-colors hover:text-theme-bronze dark:text-theme-ivory/58"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ) : null}
                {isRecording || supportVoice ? (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-theme-line/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-theme-walnut dark:border-white/10 dark:bg-white/8 dark:text-theme-ivory/78">
                    {isRecording ? (
                      <Square className="h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden="true" />
                    ) : (
                      <Mic className="h-3.5 w-3.5 shrink-0 text-theme-bronze" aria-hidden="true" />
                    )}
                    <span className="max-w-[8.75rem] truncate">
                      {isRecording
                        ? 'Recording voice note...'
                        : supportVoice?.name || 'Voice note ready'}
                    </span>
                    <button
                      type="button"
                      onClick={clearSupportVoice}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-theme-walnut/58 transition-colors hover:text-theme-bronze dark:text-theme-ivory/58"
                      title={isRecording ? 'Stop recording' : 'Remove voice note'}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ) : null}
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <input
                ref={composerImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleComposerImageSelect}
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                rows={1}
                placeholder="Ask about sofas, chairs, recliners..."
                className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-theme-line bg-white/78 px-3.5 py-3 text-sm text-theme-ink outline-none transition-colors placeholder:text-theme-walnut/45 focus:border-theme-bronze dark:border-white/10 dark:bg-white/8 dark:text-theme-ivory dark:placeholder:text-theme-ivory/42"
              />
              <button
                type="button"
                onClick={() => composerImageInputRef.current?.click()}
                disabled={isSending || isRecording}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-theme-line bg-white/78 text-theme-walnut transition-colors hover:border-theme-bronze hover:text-theme-bronze disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/8 dark:text-theme-ivory/78"
                title="Upload image"
              >
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  void toggleComposerRecording();
                }}
                disabled={isSending}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  isRecording
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-theme-line bg-white/78 text-theme-walnut hover:border-theme-bronze hover:text-theme-bronze dark:border-white/10 dark:bg-white/8 dark:text-theme-ivory/78'
                }`}
                title={isRecording ? 'Stop recording' : 'Record voice'}
              >
                {isRecording ? (
                  <Square className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Mic className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="submit"
                disabled={(!input.trim() && !hasComposerAttachments) || isSending || isRecording}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-theme-bronze text-white transition-colors hover:bg-theme-ink disabled:cursor-not-allowed disabled:opacity-45 dark:hover:bg-theme-olive"
                title="Send"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-theme-bronze text-white shadow-[0_18px_55px_rgba(18,14,11,0.26)] transition-transform hover:scale-105"
          aria-label="Open shopping assistant"
        >
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
