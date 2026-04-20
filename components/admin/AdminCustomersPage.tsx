'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  PlusCircle,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api/browser';
import { extractApiError, unwrapApiArray } from '@/lib/adminApi';

interface CustomerRecord {
  _id: string;
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type CustomerForm = {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  active: boolean;
};

function emptyForm(): CustomerForm {
  return {
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'Buyer',
    password: '',
    active: true,
  };
}

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
      <p className="mt-2 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">{note}</p>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/users'), {
        cache: 'no-store',
        credentials: 'include',
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Failed to load customer records.'));
      }

      setCustomers(unwrapApiArray<CustomerRecord>(payload));
    } catch (loadError) {
      setCustomers([]);
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load customer records.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...customers]
      .filter((customer) => {
        if (!query) {
          return true;
        }

        return [customer.name, customer.username, customer.email, customer.phone, customer.role]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [customers, search]);

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.active).length,
    [customers]
  );

  const adminCustomers = useMemo(
    () =>
      customers.filter((customer) => customer.role.trim().toLowerCase() === 'admin').length,
    [customers]
  );

  const recentCustomers = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return customers.filter((customer) => {
      if (!customer.createdAt) {
        return false;
      }

      return new Date(customer.createdAt).getTime() >= cutoff;
    }).length;
  }, [customers]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setError('');
    setSuccess('');
  };

  const openEdit = (customer: CustomerRecord) => {
    setForm({
      name: customer.name,
      username: customer.username,
      email: customer.email,
      phone: customer.phone,
      role: customer.role || 'Buyer',
      password: '',
      active: customer.active,
    });
    setEditingId(customer._id || customer.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.name.trim() || !form.email.trim()) {
        throw new Error('Name and email are required.');
      }

      if (!editingId && !form.password.trim()) {
        throw new Error('Password is required when creating a customer.');
      }

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role.trim() || 'Buyer',
        active: form.active,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const response = await fetch(
        getApiUrl(editingId ? `/api/users/${editingId}` : '/api/users'),
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to save customer.'));
      }

      setSuccess(editingId ? 'Customer updated.' : 'Customer created.');
      resetForm();
      setShowForm(false);
      await loadCustomers();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save customer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer record?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl(`/api/users/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractApiError(result, 'Failed to delete customer.'));
      }

      setSuccess('Customer deleted.');
      await loadCustomers();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete customer.'
      );
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-theme-walnut/56 dark:text-theme-ivory/56">
          Loading Customer Records
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
              Customer Directory
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-theme-ink dark:text-theme-ivory sm:text-4xl md:text-6xl">
              Real user records, ready for admin review and updates.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-theme-walnut/72 dark:text-theme-ivory/66 md:text-base">
              This page is wired to the user API so the admin panel can fetch, create, edit, and
              remove customer accounts from one place.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-theme-line/60 bg-theme-ink p-5 text-theme-ivory shadow-[0_18px_48px_rgba(26,22,19,0.16)] dark:bg-white dark:text-[var(--theme-contrast-ink)]">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">
              Data Source
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7">
              <p>{customers.length} user records currently available through `/api/users`.</p>
              <p>{adminCustomers} record(s) have admin-level roles assigned.</p>
              <p>
                Search, profile cleanup, and password resets can now happen without leaving the
                admin panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={String(customers.length)}
          note="Fetched directly from the user collection"
          icon={Users}
        />
        <StatCard
          label="Active"
          value={String(activeCustomers)}
          note="Accounts currently marked active"
          icon={UserCheck}
        />
        <StatCard
          label="Admins"
          value={String(adminCustomers)}
          note="Users with administrative access roles"
          icon={ShieldCheck}
        />
        <StatCard
          label="Added Recently"
          value={String(recentCustomers)}
          note="New customer records created in the last 30 days"
          icon={PlusCircle}
        />
      </div>

      <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
              User Management
            </p>
            <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
              Customers
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
              Keep buyer accounts aligned with the database records used by authentication,
              checkout, and customer-facing flows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                openCreate();
              }
              setShowForm((current) => !current);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-theme-bronze px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-ink sm:w-auto"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
            {showForm ? 'Close' : 'Add Customer'}
          </button>
        </div>

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

        <div className="mb-5 flex items-center gap-3 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5">
          <Search className="h-4 w-4 text-theme-bronze" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone, username, or role"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

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
                <label className={labelClass()}>Username</label>
                <input
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, username: event.target.value }))
                  }
                  className={inputClass()}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
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
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div>
                <label className={labelClass()}>Role</label>
                <input
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                  className={inputClass()}
                />
              </div>

              <div className="lg:col-span-2">
                <label className={labelClass()}>
                  {editingId ? 'Reset Password (Optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className={inputClass(!editingId && !form.password.trim())}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-4 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5 sm:w-auto">
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

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-theme-bronze disabled:opacity-60 sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {saving ? 'Saving' : editingId ? 'Update Customer' : 'Create Customer'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="w-full rounded-full border border-theme-line/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut/68 dark:text-theme-ivory/64 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : null}

        <div className="space-y-3">
          {filteredCustomers.map((customer) => {
            const recordId = customer._id || customer.id;

            return (
              <div
                key={recordId}
                className="rounded-[1.6rem] border border-theme-line/50 bg-white/76 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                        {customer.name || customer.email}
                      </p>
                      <span className="rounded-full border border-theme-line/60 bg-theme-ivory/62 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-theme-bronze dark:bg-white/5">
                        {customer.role || 'Buyer'}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${
                          customer.active
                            ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
                            : 'border-theme-line/60 bg-theme-ivory/62 text-theme-walnut/62 dark:bg-white/5 dark:text-theme-ivory/60'
                        }`}
                      >
                        {customer.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-theme-walnut/64 dark:text-theme-ivory/60">
                      {customer.email}
                    </p>
                    <p className="mt-1 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                      {customer.username ? `@${customer.username} | ` : ''}
                      {customer.phone || 'No phone saved'} | Added {formatDate(customer.createdAt)}
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => openEdit(customer)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] sm:flex-none"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(recordId)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 sm:flex-none"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!filteredCustomers.length ? (
            <div className="rounded-[1.4rem] border border-dashed border-theme-line/60 px-4 py-8 text-center text-sm text-theme-walnut/56 dark:text-theme-ivory/52">
              No customer records matched the current search.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
