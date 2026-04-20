'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api/browser';
import { getCountryOption } from '@/lib/addressDirectory';

interface CustomizationRequest {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productId: string;
  quantity: number;
  selectedFeaturedColor?: { name: string; hex: string };
  customColorName?: string;
  customColorCode?: string;
  sizeOrConfiguration?: string;
  selectedMaterial?: string;
  selectedFinish?: string;
  selectedAddons: string[];
  customDescription: string;
  preferredContactMethod: string;
  preferredCallTime?: string;
  deliveryCountry?: string;
  deliveryState?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  deliveryAddressLine1?: string;
  deliveryAddressLine2?: string;
  deliveryAddress?: string;
  expectedTimeline?: string;
  adminNotes?: string;
  status: 'pending' | 'in-review' | 'approved' | 'contacted' | 'completed' | 'rejected';
  createdAt: string;
  contactedAt?: string;
}

const STATUSES = [
  'pending',
  'in-review',
  'approved',
  'contacted',
  'completed',
  'rejected',
] as const;

function statusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'border-amber-300/70 bg-amber-50 text-amber-700';
    case 'in-review':
      return 'border-blue-300/70 bg-blue-50 text-blue-700';
    case 'approved':
      return 'border-emerald-300/70 bg-emerald-50 text-emerald-700';
    case 'contacted':
      return 'border-purple-300/70 bg-purple-50 text-purple-700';
    case 'completed':
      return 'border-teal-300/70 bg-teal-50 text-teal-700';
    case 'rejected':
      return 'border-red-300/70 bg-red-50 text-red-700';
    default:
      return 'border-theme-line/60 bg-theme-ivory/70 text-theme-walnut/66';
  }
}

function formatDate(value?: string, withTime = false) {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'Not available';
  }

  return withTime
    ? parsed.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : parsed.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function formatDeliveryLocation(item: Pick<CustomizationRequest, 'deliveryCity' | 'deliveryState'>) {
  return [item.deliveryCity, item.deliveryState].filter(Boolean).join(', ') || 'Address not shared';
}

function formatDeliveryAddress(
  item: Pick<
    CustomizationRequest,
    | 'deliveryAddress'
    | 'deliveryAddressLine1'
    | 'deliveryAddressLine2'
    | 'deliveryCity'
    | 'deliveryState'
    | 'deliveryPincode'
    | 'deliveryCountry'
  >
) {
  const countryName = getCountryOption(item.deliveryCountry)?.name || item.deliveryCountry || '';
  const addressBase =
    item.deliveryAddress ||
    [item.deliveryAddressLine1, item.deliveryAddressLine2].filter(Boolean).join(', ');

  return [addressBase, item.deliveryCity, item.deliveryState, item.deliveryPincode, countryName]
    .filter(Boolean)
    .join(', ') || 'Address not shared';
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.7rem] border border-theme-line/60 bg-white/76 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.06)] dark:bg-white/5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">
        {label}
      </p>
      <p className="mt-6 font-display text-3xl text-theme-ink dark:text-theme-ivory sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">{note}</p>
    </div>
  );
}

export default function AdminCustomizationsPage() {
  const [customizations, setCustomizations] = useState<CustomizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<CustomizationRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomizations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(getApiUrl(`/api/admin/customizations?${params}`), {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch customization requests.');
      }

      setCustomizations(Array.isArray(data?.customizations) ? data.customizations : []);
    } catch (loadError) {
      setCustomizations([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to fetch customization requests.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void fetchCustomizations();
  }, [fetchCustomizations]);

  const filteredCustomizations = useMemo(
    () =>
      customizations.filter((item) => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return [
          item.customerName,
          item.customerEmail,
          item.productName,
          item.deliveryAddress,
          item.deliveryAddressLine1,
          item.deliveryAddressLine2,
          item.deliveryCity,
          item.deliveryState,
          item.deliveryPincode,
          item.sizeOrConfiguration,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      }),
    [customizations, searchTerm]
  );

  const statusCounts = useMemo(
    () =>
      STATUSES.reduce<Record<string, number>>((accumulator, status) => {
        accumulator[status] = customizations.filter((item) => item.status === status).length;
        return accumulator;
      }, {}),
    [customizations]
  );

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/admin/customizations'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update customization request.');
      }

      await fetchCustomizations();
      setSelectedItem(null);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update customization request.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-[2.4rem] border border-theme-line/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(244,232,215,0.8))] p-6 shadow-[0_24px_80px_rgba(49,30,21,0.1)] dark:bg-[linear-gradient(135deg,rgba(54,40,33,0.52),rgba(24,18,15,0.8))] md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
              Bespoke Requests
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-theme-ink dark:text-theme-ivory sm:text-4xl md:text-6xl">
              Follow every customization enquiry from first idea to final approval.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-theme-walnut/72 dark:text-theme-ivory/66 md:text-base">
              Keep the made-to-order queue visible, review materials and color requests faster,
              and move each request cleanly through the design conversation.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-theme-line/60 bg-theme-ink p-5 text-theme-ivory shadow-[0_18px_48px_rgba(26,22,19,0.16)] dark:bg-white dark:text-[var(--theme-contrast-ink)]">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">
              Response Desk
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7">
              <p>{statusCounts.pending || 0} new request(s) are waiting for the first review.</p>
              <p>{statusCounts['in-review'] || 0} request(s) are actively being evaluated.</p>
              <p>{statusCounts.contacted || 0} request(s) have already moved into direct follow-up.</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="flex items-center gap-3 rounded-[1.4rem] border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={String(customizations.length)}
          note="All visible customization enquiries"
        />
        <StatCard
          label="Pending"
          value={String(statusCounts.pending || 0)}
          note="Need first response from the admin team"
        />
        <StatCard
          label="In Review"
          value={String(statusCounts['in-review'] || 0)}
          note="Currently being evaluated internally"
        />
        <StatCard
          label="Completed"
          value={String(statusCounts.completed || 0)}
          note="Closed and delivered customization journeys"
        />
      </div>

      <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex min-w-0 w-full flex-1 items-center gap-3 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5 sm:min-w-[260px]">
            <Search className="h-4 w-4 text-theme-bronze" />
            <input
              type="text"
              placeholder="Search by customer, email, product, or address"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5 sm:w-auto"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-review">In review</option>
            <option value="approved">Approved</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-theme-walnut/56 dark:text-theme-ivory/56">
              Loading Customizations
            </p>
          </div>
        ) : filteredCustomizations.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-theme-line/60 px-4 py-10 text-center text-sm text-theme-walnut/56 dark:text-theme-ivory/52">
            No customization requests matched the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCustomizations.map((item) => (
              <div
                key={item._id}
                className="rounded-[1.7rem] border border-theme-line/50 bg-white/76 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                        {item.customerName}
                      </p>
                      <span
                        className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status.replace('-', ' ')}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-theme-walnut/64 dark:text-theme-ivory/60">
                      {item.productName} | Qty {item.quantity}
                    </p>
                    {item.sizeOrConfiguration ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-bronze">
                        {item.sizeOrConfiguration}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-theme-bronze" />
                        {item.customerEmail}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-theme-bronze" />
                        {item.customerPhone}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-theme-bronze" />
                        {formatDeliveryLocation(item)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-theme-bronze" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-theme-line/50 bg-theme-ivory/62 px-4 py-3 dark:bg-white/4">
                      <p className="text-[0.62rem] uppercase tracking-[0.2em] text-theme-bronze">
                        Color
                      </p>
                      <p className="mt-2 text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                        {item.selectedFeaturedColor?.name || item.customColorName || 'Custom'}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-theme-line/50 bg-theme-ivory/62 px-4 py-3 dark:bg-white/4">
                      <p className="text-[0.62rem] uppercase tracking-[0.2em] text-theme-bronze">
                        Material
                      </p>
                      <p className="mt-2 text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                        {item.selectedMaterial || 'Not specified'}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-theme-line/50 bg-theme-ivory/62 px-4 py-3 dark:bg-white/4">
                      <p className="text-[0.62rem] uppercase tracking-[0.2em] text-theme-bronze">
                        Contact
                      </p>
                      <p className="mt-2 text-sm font-semibold capitalize text-theme-ink dark:text-theme-ivory">
                        {item.preferredContactMethod || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:border-theme-bronze hover:text-theme-bronze sm:w-auto"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedItem ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(26,22,19,0.52)] p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.97),rgba(247,239,228,0.94))] shadow-[0_32px_90px_rgba(26,22,19,0.24)] dark:bg-[linear-gradient(145deg,rgba(43,33,27,0.95),rgba(20,15,12,0.96))]">
            <div className="flex flex-col items-start gap-4 border-b border-theme-line/50 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                  Customization Review
                </p>
                <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
                  {selectedItem.customerName}
                </h2>
                <p className="mt-2 text-sm text-theme-walnut/64 dark:text-theme-ivory/60">
                  {selectedItem.productName} | Submitted {formatDate(selectedItem.createdAt, true)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-full border border-theme-line/60 p-2 text-theme-walnut/64 transition hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-5">
                <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/5">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                    Customer
                  </p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <p><span className="font-semibold">Email:</span> {selectedItem.customerEmail}</p>
                    <p><span className="font-semibold">Phone:</span> {selectedItem.customerPhone}</p>
                    <p><span className="font-semibold">Delivery address:</span> {formatDeliveryAddress(selectedItem)}</p>
                    <p><span className="font-semibold">Preferred contact:</span> {selectedItem.preferredContactMethod || 'Not shared'}</p>
                    <p><span className="font-semibold">Preferred time:</span> {selectedItem.preferredCallTime || 'Not shared'}</p>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/5">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                    Product Request
                  </p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <p><span className="font-semibold">Product:</span> {selectedItem.productName}</p>
                    <p><span className="font-semibold">Quantity:</span> {selectedItem.quantity}</p>
                    <p><span className="font-semibold">Sofa type:</span> {selectedItem.sizeOrConfiguration || 'Not specified'}</p>
                    <p><span className="font-semibold">Material:</span> {selectedItem.selectedMaterial || 'Not specified'}</p>
                    <p><span className="font-semibold">Finish:</span> {selectedItem.selectedFinish || 'Not specified'}</p>
                    <p><span className="font-semibold">Expected timeline:</span> {selectedItem.expectedTimeline || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/5">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                    Color & Extras
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      {selectedItem.selectedFeaturedColor ? (
                        <span
                          className="h-8 w-8 rounded-full border border-theme-line/60"
                          style={{ backgroundColor: selectedItem.selectedFeaturedColor.hex }}
                        />
                      ) : null}
                      <div>
                        <p className="font-semibold text-theme-ink dark:text-theme-ivory">
                          {selectedItem.selectedFeaturedColor?.name || selectedItem.customColorName || 'Custom tone'}
                        </p>
                        {selectedItem.customColorCode ? (
                          <p className="text-xs text-theme-walnut/58 dark:text-theme-ivory/54">
                            {selectedItem.customColorCode}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-theme-ink dark:text-theme-ivory">Selected add-ons</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedItem.selectedAddons?.length ? (
                          selectedItem.selectedAddons.map((addon) => (
                            <span
                              key={addon}
                              className="rounded-full border border-theme-line/60 bg-theme-ivory/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-theme-bronze dark:bg-white/6"
                            >
                              {addon}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-theme-walnut/60 dark:text-theme-ivory/56">
                            No add-ons selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/5">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                    Notes
                  </p>
                  <p className="mt-4 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
                    {selectedItem.customDescription || 'No extra description provided.'}
                  </p>
                  {selectedItem.adminNotes ? (
                    <p className="mt-4 rounded-[1rem] border border-theme-line/50 bg-theme-ivory/62 px-3 py-3 text-sm text-theme-walnut/70 dark:bg-white/6 dark:text-theme-ivory/62">
                      Admin notes: {selectedItem.adminNotes}
                    </p>
                  ) : null}
                  {selectedItem.contactedAt ? (
                    <p className="mt-4 text-xs text-theme-walnut/56 dark:text-theme-ivory/52">
                      Contacted on {formatDate(selectedItem.contactedAt, true)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="border-t border-theme-line/50 px-6 py-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-theme-bronze" />
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-theme-bronze">
                  Update Status
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => void handleStatusUpdate(selectedItem._id, status)}
                    disabled={updatingStatus || selectedItem.status === status}
                    className={`rounded-[1rem] border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                      selectedItem.status === status
                        ? `${statusClass(status)} cursor-default`
                        : 'border-theme-line/60 bg-white/70 text-theme-walnut/68 hover:border-theme-bronze hover:text-theme-bronze disabled:opacity-50 dark:bg-white/5 dark:text-theme-ivory/62'
                    }`}
                  >
                    {updatingStatus && selectedItem.status !== status ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {status.replace('-', ' ')}
                      </span>
                    ) : (
                      status.replace('-', ' ')
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
