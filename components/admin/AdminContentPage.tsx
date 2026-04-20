'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Inbox,
  Loader2,
  Mail,
  Pencil,
  PlusCircle,
  Quote,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { AdminProduct } from '@/lib/adminDashboard';
import { getApiUrl } from '@/lib/api/browser';
import {
  extractApiError,
  isRecord,
  readEntityId,
  readString,
  unwrapApiArray,
} from '@/lib/adminApi';

interface FaqRecord {
  _id: string;
  id: string;
  question: string;
  answer: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FeatureRecord {
  _id: string;
  id: string;
  name: string;
  shortDescription: string;
  icon: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserOption {
  _id: string;
  id: string;
  name: string;
  email: string;
}

type ProductOption = Pick<AdminProduct, '_id' | 'id' | 'name'>;

interface TestimonialRecord {
  _id: string;
  id: string;
  user: unknown;
  product: unknown;
  message: string;
  star: number;
  createdAt?: string;
  updatedAt?: string;
}

interface NewsletterRecord {
  _id: string;
  id: string;
  email: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactRecord {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type FaqForm = {
  question: string;
  answer: string;
  active: boolean;
};

type FeatureForm = {
  name: string;
  shortDescription: string;
  icon: string;
  active: boolean;
};

type TestimonialForm = {
  user: string;
  product: string;
  message: string;
  star: string;
};

type NewsletterForm = {
  email: string;
  active: boolean;
};

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  active: boolean;
};

function inputClass(error?: boolean) {
  return `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition dark:bg-white/5 dark:text-theme-ivory ${
    error
      ? 'border-red-400 bg-red-50/80 focus:border-red-400'
      : 'border-theme-line/60 bg-white/70 focus:border-theme-bronze'
  }`;
}

function labelClass() {
  return 'mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/66 dark:text-theme-ivory/60';
}

function formatDate(value?: string) {
  if (!value) {
    return 'Recently';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'Recently';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getUserLabel(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (isRecord(value)) {
    return (
      readString(value.name) ||
      readString(value.email) ||
      readString(value.username) ||
      readEntityId(value) ||
      'Unknown user'
    );
  }

  return 'Unknown user';
}

function getProductLabel(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (isRecord(value)) {
    return readString(value.name) || readEntityId(value) || 'No linked product';
  }

  return 'No linked product';
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.7rem] border border-theme-line/60 bg-white/76 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.06)] dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">
          {label}
        </p>
        <div className="rounded-2xl border border-theme-line/60 bg-theme-ink p-2 text-white dark:bg-white dark:text-[var(--theme-contrast-ink)]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-6 font-display text-3xl text-theme-ink dark:text-theme-ivory sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">
        {note}
      </p>
    </div>
  );
}

function Feedback({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  return (
    <>
      {error ? (
        <div className="mb-5 flex items-center gap-3 rounded-[1.2rem] border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-5 flex items-center gap-3 rounded-[1.2rem] border border-emerald-400/30 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      ) : null}
    </>
  );
}

function StudioShell({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function FaqStudio({
  items,
  onRefresh,
}: {
  items: FaqRecord[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<FaqForm>({ question: '', answer: '', active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm({ question: '', answer: '', active: true });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.question.trim() || !form.answer.trim()) {
        throw new Error('Question and answer are required.');
      }

      const response = await fetch(
        getApiUrl(editingId ? `/api/faqs/${editingId}` : '/api/faqs'),
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            question: form.question.trim(),
            answer: form.answer.trim(),
            active: form.active,
          }),
        }
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to save FAQ.'));
      }

      setSuccess(editingId ? 'FAQ updated.' : 'FAQ created.');
      resetForm();
      setShowForm(false);
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this FAQ entry?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`/api/faqs/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to delete FAQ.'));
      }

      setSuccess('FAQ deleted.');
      await onRefresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete FAQ.');
    }
  };

  return (
    <StudioShell
      eyebrow="Knowledge Base"
      title="FAQs"
      description="Keep the public question-and-answer library synchronized with the FAQ API."
      action={
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            }
            setShowForm((current) => !current);
            setError('');
            setSuccess('');
          }}
          className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add FAQ'}
        </button>
      }
    >
      <Feedback error={error} success={success} />

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-[1.8rem] border border-theme-line/50 bg-white/74 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
        >
          <div>
            <label className={labelClass()}>Question</label>
            <input
              value={form.question}
              onChange={(event) =>
                setForm((current) => ({ ...current, question: event.target.value }))
              }
              className={inputClass(!form.question.trim())}
            />
          </div>

          <div className="mt-5">
            <label className={labelClass()}>Answer</label>
            <textarea
              rows={4}
              value={form.answer}
              onChange={(event) =>
                setForm((current) => ({ ...current, answer: event.target.value }))
              }
              className={inputClass(!form.answer.trim())}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-walnut/70 dark:text-theme-ivory/66">
                Active
              </span>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, active: !current.active }))}
                className={`relative h-8 w-14 rounded-full transition ${
                  form.active ? 'bg-theme-bronze' : 'bg-theme-sand'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    form.active ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-theme-bronze disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? 'Saving' : editingId ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const itemId = item._id || item.id;

          return (
            <div
              key={itemId}
              className="rounded-[1.5rem] border border-theme-line/50 bg-white/74 p-5 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                      {item.question}
                    </p>
                    <span
                      className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${
                        item.active
                          ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
                          : 'border-theme-line/60 bg-theme-ivory/62 text-theme-walnut/62 dark:bg-white/5 dark:text-theme-ivory/60'
                      }`}
                    >
                      {item.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
                    {item.answer}
                  </p>
                  <p className="mt-3 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                    Updated {formatDate(item.updatedAt || item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        question: item.question,
                        answer: item.answer,
                        active: item.active,
                      });
                      setEditingId(itemId);
                      setShowForm(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(itemId)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!items.length ? (
          <div className="rounded-[1.4rem] border border-dashed border-theme-line/60 px-4 py-8 text-center text-sm text-theme-walnut/56 dark:text-theme-ivory/52">
            No FAQ records found yet.
          </div>
        ) : null}
      </div>
    </StudioShell>
  );
}

function FeatureStudio({
  items,
  onRefresh,
}: {
  items: FeatureRecord[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<FeatureForm>({
    name: '',
    shortDescription: '',
    icon: '',
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm({ name: '', shortDescription: '', icon: '', active: true });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.name.trim() || !form.shortDescription.trim()) {
        throw new Error('Name and short description are required.');
      }

      const response = await fetch(
        getApiUrl(editingId ? `/api/features/${editingId}` : '/api/features'),
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name.trim(),
            shortDescription: form.shortDescription.trim(),
            icon: form.icon.trim(),
            active: form.active,
          }),
        }
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to save feature.'));
      }

      setSuccess(editingId ? 'Feature updated.' : 'Feature created.');
      resetForm();
      setShowForm(false);
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save feature.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feature?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`/api/features/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to delete feature.'));
      }

      setSuccess('Feature deleted.');
      await onRefresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete feature.'
      );
    }
  };

  return (
    <StudioShell
      eyebrow="Store Highlights"
      title="Features"
      description="Manage the feature cards and short selling points exposed by the feature API."
      action={
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            }
            setShowForm((current) => !current);
            setError('');
            setSuccess('');
          }}
          className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add Feature'}
        </button>
      }
    >
      <Feedback error={error} success={success} />

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-[1.8rem] border border-theme-line/50 bg-white/74 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass()}>Name</label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={inputClass(!form.name.trim())}
              />
            </div>

            <div>
              <label className={labelClass()}>Icon Name</label>
              <input
                value={form.icon}
                onChange={(event) =>
                  setForm((current) => ({ ...current, icon: event.target.value }))
                }
                className={inputClass()}
                placeholder="Sparkles"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass()}>Short Description</label>
            <textarea
              rows={4}
              value={form.shortDescription}
              onChange={(event) =>
                setForm((current) => ({ ...current, shortDescription: event.target.value }))
              }
              className={inputClass(!form.shortDescription.trim())}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-walnut/70 dark:text-theme-ivory/66">
                Active
              </span>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, active: !current.active }))}
                className={`relative h-8 w-14 rounded-full transition ${
                  form.active ? 'bg-theme-bronze' : 'bg-theme-sand'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    form.active ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-theme-bronze disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? 'Saving' : editingId ? 'Update Feature' : 'Create Feature'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const itemId = item._id || item.id;

          return (
            <div
              key={itemId}
              className="rounded-[1.5rem] border border-theme-line/50 bg-white/74 p-5 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                      {item.name}
                    </p>
                    {item.icon ? (
                      <span className="rounded-full border border-theme-line/60 bg-theme-ivory/62 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-theme-bronze dark:bg-white/5">
                        {item.icon}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${
                        item.active
                          ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
                          : 'border-theme-line/60 bg-theme-ivory/62 text-theme-walnut/62 dark:bg-white/5 dark:text-theme-ivory/60'
                      }`}
                    >
                      {item.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
                    {item.shortDescription}
                  </p>
                  <p className="mt-3 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                    Updated {formatDate(item.updatedAt || item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        name: item.name,
                        shortDescription: item.shortDescription,
                        icon: item.icon,
                        active: item.active,
                      });
                      setEditingId(itemId);
                      setShowForm(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(itemId)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!items.length ? (
          <div className="rounded-[1.4rem] border border-dashed border-theme-line/60 px-4 py-8 text-center text-sm text-theme-walnut/56 dark:text-theme-ivory/52">
            No feature records found yet.
          </div>
        ) : null}
      </div>
    </StudioShell>
  );
}

function TestimonialStudio({
  items,
  users,
  products,
  onRefresh,
}: {
  items: TestimonialRecord[];
  users: UserOption[];
  products: ProductOption[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<TestimonialForm>({
    user: '',
    product: '',
    message: '',
    star: '5',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sortedUsers = useMemo(
    () => [...users].sort((left, right) => left.name.localeCompare(right.name)),
    [users]
  );
  const sortedProducts = useMemo(
    () => [...products].sort((left, right) => left.name.localeCompare(right.name)),
    [products]
  );

  const resetForm = () => {
    setForm({ user: '', product: '', message: '', star: '5' });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.user.trim() || !form.message.trim()) {
        throw new Error('User and testimonial message are required.');
      }

      const response = await fetch(
        getApiUrl(editingId ? `/api/testimonials/${editingId}` : '/api/testimonials'),
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user: form.user.trim(),
            product: form.product.trim(),
            message: form.message.trim(),
            star: Number(form.star || 5),
          }),
        }
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to save testimonial.'));
      }

      setSuccess(editingId ? 'Testimonial updated.' : 'Testimonial created.');
      resetForm();
      setShowForm(false);
      await onRefresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to save testimonial.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`/api/testimonials/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to delete testimonial.'));
      }

      setSuccess('Testimonial deleted.');
      await onRefresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete testimonial.'
      );
    }
  };

  return (
    <StudioShell
      eyebrow="Social Proof"
      title="Testimonials"
      description="Create and maintain testimonial entries linked to real users and optional products."
      action={
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            }
            setShowForm((current) => !current);
            setError('');
            setSuccess('');
          }}
          className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add Testimonial'}
        </button>
      }
    >
      <Feedback error={error} success={success} />

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-[1.8rem] border border-theme-line/50 bg-white/74 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass()}>Customer</label>
              <select
                value={form.user}
                onChange={(event) =>
                  setForm((current) => ({ ...current, user: event.target.value }))
                }
                className={inputClass(!form.user.trim())}
              >
                <option value="">Select customer</option>
                {sortedUsers.map((user) => {
                  const userId = user._id || user.id;
                  return (
                    <option key={userId} value={userId}>
                      {user.name || user.email}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className={labelClass()}>Product (Optional)</label>
              <select
                value={form.product}
                onChange={(event) =>
                  setForm((current) => ({ ...current, product: event.target.value }))
                }
                className={inputClass()}
              >
                <option value="">No linked product</option>
                {sortedProducts.map((product) => {
                  const productId = product._id || product.id;
                  return (
                    <option key={productId} value={productId}>
                      {product.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass()}>Message</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              className={inputClass(!form.message.trim())}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[180px_auto]">
            <div>
              <label className={labelClass()}>Rating</label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.star}
                onChange={(event) =>
                  setForm((current) => ({ ...current, star: event.target.value }))
                }
                className={inputClass()}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-theme-bronze disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saving ? 'Saving' : editingId ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const itemId = item._id || item.id;

          return (
            <div
              key={itemId}
              className="rounded-[1.5rem] border border-theme-line/50 bg-white/74 p-5 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                      {getUserLabel(item.user)}
                    </p>
                    <span className="rounded-full border border-theme-line/60 bg-theme-ivory/62 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-theme-bronze dark:bg-white/5">
                      Rating {Math.min(5, Math.max(1, Number(item.star || 5)))}/5
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-theme-walnut/56 dark:text-theme-ivory/52">
                    {getProductLabel(item.product)}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
                    {item.message}
                  </p>
                  <p className="mt-3 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                    Updated {formatDate(item.updatedAt || item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        user: readEntityId(item.user),
                        product: readEntityId(item.product),
                        message: item.message,
                        star: String(item.star || 5),
                      });
                      setEditingId(itemId);
                      setShowForm(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(itemId)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!items.length ? (
          <div className="rounded-[1.4rem] border border-dashed border-theme-line/60 px-4 py-8 text-center text-sm text-theme-walnut/56 dark:text-theme-ivory/52">
            No testimonial records found yet.
          </div>
        ) : null}
      </div>
    </StudioShell>
  );
}

function NewsletterStudio({
  items,
  onRefresh,
}: {
  items: NewsletterRecord[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<NewsletterForm>({ email: '', active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm({ email: '', active: true });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.email.trim()) {
        throw new Error('Email is required.');
      }

      const response = await fetch(
        getApiUrl(editingId ? `/api/newsletters/${editingId}` : '/api/newsletters'),
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: form.email.trim(),
            active: form.active,
          }),
        }
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to save newsletter record.'));
      }

      setSuccess(editingId ? 'Newsletter record updated.' : 'Newsletter record created.');
      resetForm();
      setShowForm(false);
      await onRefresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to save newsletter record.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this newsletter record?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`/api/newsletters/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to delete newsletter record.'));
      }

      setSuccess('Newsletter record deleted.');
      await onRefresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete newsletter record.'
      );
    }
  };

  return (
    <StudioShell
      eyebrow="Subscribers"
      title="Newsletters"
      description="Review and maintain the email list stored by the newsletter API."
      action={
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            }
            setShowForm((current) => !current);
            setError('');
            setSuccess('');
          }}
          className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add Email'}
        </button>
      }
    >
      <Feedback error={error} success={success} />

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-[1.8rem] border border-theme-line/50 bg-white/74 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
        >
          <div>
            <label className={labelClass()}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className={inputClass(!form.email.trim())}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-walnut/70 dark:text-theme-ivory/66">
                Active
              </span>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, active: !current.active }))}
                className={`relative h-8 w-14 rounded-full transition ${
                  form.active ? 'bg-theme-bronze' : 'bg-theme-sand'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    form.active ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-theme-bronze disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? 'Saving' : editingId ? 'Update Email' : 'Create Email'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const itemId = item._id || item.id;

          return (
            <div
              key={itemId}
              className="rounded-[1.5rem] border border-theme-line/50 bg-white/74 p-5 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                      {item.email}
                    </p>
                    <span
                      className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${
                        item.active
                          ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
                          : 'border-theme-line/60 bg-theme-ivory/62 text-theme-walnut/62 dark:bg-white/5 dark:text-theme-ivory/60'
                      }`}
                    >
                      {item.active ? 'Active' : 'Muted'}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                    Updated {formatDate(item.updatedAt || item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        email: item.email,
                        active: item.active,
                      });
                      setEditingId(itemId);
                      setShowForm(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(itemId)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!items.length ? (
          <div className="rounded-[1.4rem] border border-dashed border-theme-line/60 px-4 py-8 text-center text-sm text-theme-walnut/56 dark:text-theme-ivory/52">
            No newsletter records found yet.
          </div>
        ) : null}
      </div>
    </StudioShell>
  );
}

function ContactStudio({
  items,
  onRefresh,
}: {
  items: ContactRecord[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      active: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        throw new Error('Name, email, and message are required.');
      }

      const response = await fetch(
        getApiUrl(editingId ? `/api/contactus/${editingId}` : '/api/contactus'),
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
            active: form.active,
          }),
        }
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to save contact record.'));
      }

      setSuccess(editingId ? 'Contact record updated.' : 'Contact record created.');
      resetForm();
      setShowForm(false);
      await onRefresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to save contact record.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this contact message?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`/api/contactus/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to delete contact record.'));
      }

      setSuccess('Contact record deleted.');
      await onRefresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete contact record.'
      );
    }
  };

  return (
    <StudioShell
      eyebrow="Inbox"
      title="Contact Messages"
      description="Monitor and edit the customer messages submitted through the contact API."
      action={
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            }
            setShowForm((current) => !current);
            setError('');
            setSuccess('');
          }}
          className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add Contact'}
        </button>
      }
    >
      <Feedback error={error} success={success} />

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-[1.8rem] border border-theme-line/50 bg-white/74 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass()}>Name</label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={inputClass(!form.name.trim())}
              />
            </div>

            <div>
              <label className={labelClass()}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className={inputClass(!form.email.trim())}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass()}>Phone</label>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()}>Subject</label>
              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({ ...current, subject: event.target.value }))
                }
                className={inputClass()}
              />
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass()}>Message</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({ ...current, message: event.target.value }))
              }
              className={inputClass(!form.message.trim())}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-walnut/70 dark:text-theme-ivory/66">
                Active
              </span>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, active: !current.active }))}
                className={`relative h-8 w-14 rounded-full transition ${
                  form.active ? 'bg-theme-bronze' : 'bg-theme-sand'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    form.active ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-theme-bronze disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? 'Saving' : editingId ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const itemId = item._id || item.id;

          return (
            <div
              key={itemId}
              className="rounded-[1.5rem] border border-theme-line/50 bg-white/74 p-5 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                      {item.name || item.email}
                    </p>
                    {item.subject ? (
                      <span className="rounded-full border border-theme-line/60 bg-theme-ivory/62 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-theme-bronze dark:bg-white/5">
                        {item.subject}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${
                        item.active
                          ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
                          : 'border-theme-line/60 bg-theme-ivory/62 text-theme-walnut/62 dark:bg-white/5 dark:text-theme-ivory/60'
                      }`}
                    >
                      {item.active ? 'Open' : 'Archived'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-theme-walnut/64 dark:text-theme-ivory/60">
                    {item.email}
                    {item.phone ? ` | ${item.phone}` : ''}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
                    {item.message}
                  </p>
                  <p className="mt-3 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                    Updated {formatDate(item.updatedAt || item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        name: item.name,
                        email: item.email,
                        phone: item.phone,
                        subject: item.subject,
                        message: item.message,
                        active: item.active,
                      });
                      setEditingId(itemId);
                      setShowForm(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(itemId)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!items.length ? (
          <div className="rounded-[1.4rem] border border-dashed border-theme-line/60 px-4 py-8 text-center text-sm text-theme-walnut/56 dark:text-theme-ivory/52">
            No contact messages found yet.
          </div>
        ) : null}
      </div>
    </StudioShell>
  );
}

export default function AdminContentPage() {
  const [faqs, setFaqs] = useState<FaqRecord[]>([]);
  const [features, setFeatures] = useState<FeatureRecord[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refreshContent = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    const endpoints = [
      '/api/faqs',
      '/api/features',
      '/api/testimonials',
      '/api/newsletters',
      '/api/contactus',
      '/api/users',
      '/api/products',
    ] as const;

    try {
      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(getApiUrl(endpoint), {
            cache: 'no-store',
            credentials: 'include',
          })
        )
      );

      const payloads = await Promise.all(
        responses.map((response) => response.json().catch(() => null))
      );

      setFaqs(responses[0].ok ? unwrapApiArray<FaqRecord>(payloads[0]) : []);
      setFeatures(responses[1].ok ? unwrapApiArray<FeatureRecord>(payloads[1]) : []);
      setTestimonials(responses[2].ok ? unwrapApiArray<TestimonialRecord>(payloads[2]) : []);
      setNewsletters(responses[3].ok ? unwrapApiArray<NewsletterRecord>(payloads[3]) : []);
      setContacts(responses[4].ok ? unwrapApiArray<ContactRecord>(payloads[4]) : []);
      setUsers(responses[5].ok ? unwrapApiArray<UserOption>(payloads[5]) : []);
      setProducts(responses[6].ok ? unwrapApiArray<ProductOption>(payloads[6]) : []);

      const errors = responses
        .map((response, index) =>
          response.ok ? '' : extractApiError(payloads[index], `Failed to load ${endpoints[index]}.`)
        )
        .filter(Boolean);

      if (errors.length) {
        setLoadError(errors[0]);
      }
    } catch (error) {
      setFaqs([]);
      setFeatures([]);
      setTestimonials([]);
      setNewsletters([]);
      setContacts([]);
      setUsers([]);
      setProducts([]);
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load content management data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshContent();
  }, [refreshContent]);

  const activeFaqs = useMemo(() => faqs.filter((item) => item.active).length, [faqs]);
  const activeFeatures = useMemo(
    () => features.filter((item) => item.active).length,
    [features]
  );
  const activeNewsletters = useMemo(
    () => newsletters.filter((item) => item.active).length,
    [newsletters]
  );
  const openContacts = useMemo(
    () => contacts.filter((item) => item.active).length,
    [contacts]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-theme-walnut/56 dark:text-theme-ivory/56">
          Loading Content APIs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-[2.4rem] border border-theme-line/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(244,232,215,0.8))] p-6 shadow-[0_24px_80px_rgba(49,30,21,0.1)] dark:bg-[linear-gradient(135deg,rgba(54,40,33,0.52),rgba(24,18,15,0.8))] md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
              Content Control
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-theme-ink dark:text-theme-ivory sm:text-4xl md:text-6xl">
              Admin pages now mapped to the live content APIs.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-theme-walnut/72 dark:text-theme-ivory/66 md:text-base">
              FAQs, features, testimonials, newsletters, contact submissions, and linked customer
              references are now editable from the admin panel instead of living only behind API
              routes.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-theme-line/60 bg-theme-ink p-5 text-theme-ivory shadow-[0_18px_48px_rgba(26,22,19,0.16)] dark:bg-white dark:text-[var(--theme-contrast-ink)]">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">
              API Coverage
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7">
              <p>Content operations are now driven from `/api/faqs`, `/api/features`, and related endpoints.</p>
              <p>{users.length} customers and {products.length} products are available for testimonial linking.</p>
              <p>{openContacts} contact record(s) are still marked open for follow-up.</p>
            </div>
          </div>
        </div>
      </section>

      {loadError ? (
        <div className="flex items-center gap-3 rounded-[1.4rem] border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5">
        <StatCard
          label="FAQs"
          value={String(faqs.length)}
          note={`${activeFaqs} active record(s)`}
          icon={FileText}
        />
        <StatCard
          label="Features"
          value={String(features.length)}
          note={`${activeFeatures} active highlight(s)`}
          icon={Sparkles}
        />
        <StatCard
          label="Testimonials"
          value={String(testimonials.length)}
          note="Customer stories connected to live accounts"
          icon={Quote}
        />
        <StatCard
          label="Newsletters"
          value={String(newsletters.length)}
          note={`${activeNewsletters} active subscriber record(s)`}
          icon={Mail}
        />
        <StatCard
          label="Inbox"
          value={String(contacts.length)}
          note={`${openContacts} open message(s)`}
          icon={Inbox}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <FaqStudio items={faqs} onRefresh={refreshContent} />
        <FeatureStudio items={features} onRefresh={refreshContent} />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <TestimonialStudio
          items={testimonials}
          users={users}
          products={products}
          onRefresh={refreshContent}
        />
        <NewsletterStudio items={newsletters} onRefresh={refreshContent} />
      </div>

      <ContactStudio items={contacts} onRefresh={refreshContent} />
    </div>
  );
}
