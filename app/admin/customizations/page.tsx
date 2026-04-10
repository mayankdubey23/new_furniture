'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getApiUrl } from '@/lib/api/browser';

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
  selectedMaterial?: string;
  selectedFinish?: string;
  selectedAddons: string[];
  customDescription: string;
  preferredContactMethod: string;
  preferredCallTime?: string;
  deliveryCity?: string;
  expectedTimeline?: string;
  status: 'pending' | 'in-review' | 'approved' | 'contacted' | 'completed' | 'rejected';
  createdAt: string;
  contactedAt?: string;
}

export default function AdminCustomizationsPage() {
  const [customizations, setCustomizations] = useState<CustomizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<CustomizationRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCustomizations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await fetch(getApiUrl(`/api/admin/customizations?${params}`));
      const data = await response.json();
      setCustomizations(data.customizations);
    } catch (error) {
      console.error('Error fetching customizations:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void fetchCustomizations();
  }, [fetchCustomizations]);

  const filteredCustomizations = useMemo(
    () =>
      customizations.filter((item: CustomizationRequest) =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [customizations, searchTerm]
  );

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/customizations'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (response.ok) {
        fetchCustomizations();
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error updating customization:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in-review':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'contacted':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-ink via-theme-ink/95 to-theme-ink/90 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-12">
          <h1 className="font-display text-3xl md:text-4xl text-theme-ivory mb-2">
            Customization Requests
          </h1>
          <p className="text-theme-ivory/60">
            Manage all incoming customer customization requests
          </p>
        </div>


        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search by name, email, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none md:col-span-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="approved">Approved</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>


        {loading ? (
          <div className="text-center py-10">
            <p className="text-theme-ivory/60">Loading customizations...</p>
          </div>
        ) : filteredCustomizations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-theme-ivory/60">No customizations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-theme-bronze/20">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme-bronze/20 bg-theme-bronze/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-theme-bronze">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-theme-bronze">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-theme-bronze">
                    Color
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-theme-bronze">
                    Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-theme-bronze">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-theme-bronze">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomizations.map((item: CustomizationRequest) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-theme-bronze/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-theme-ivory">{item.customerName}</p>
                        <p className="text-xs text-theme-ivory/60">{item.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-theme-ivory">{item.productName}</p>
                      <p className="text-xs text-theme-ivory/60">Qty: {item.quantity}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.selectedFeaturedColor && (
                          <div
                            className="h-4 w-4 rounded-full border border-theme-bronze/20"
                            style={{ backgroundColor: item.selectedFeaturedColor.hex }}
                          />
                        )}
                        <p className="text-sm text-theme-ivory">
                          {item.selectedFeaturedColor?.name || item.customColorName || 'Custom'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-theme-ivory">{item.selectedMaterial || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusBadgeColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-xs font-semibold text-theme-bronze hover:text-theme-bronze/80 transition-colors"
                      >
                        View Details →
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-theme-bronze/20 bg-theme-ink p-8 backdrop-blur-md"
          >

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl text-theme-ivory">
                  {selectedItem.customerName}
                </h2>
                <p className="text-sm text-theme-ivory/60">{selectedItem.customerEmail}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-theme-ivory/60 hover:text-theme-ivory transition-colors"
              >
                ✕
              </button>
            </div>


            <div className="mb-6 border-t border-theme-bronze/20" />


            <div className="space-y-6">

              <div>
                <h3 className="mb-3 font-semibold text-theme-ivory">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-theme-ivory/60">Email</p>
                    <p className="text-theme-ivory">{selectedItem.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-theme-ivory/60">Phone</p>
                    <p className="text-theme-ivory">{selectedItem.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-theme-ivory/60">City</p>
                    <p className="text-theme-ivory">{selectedItem.deliveryCity || '—'}</p>
                  </div>
                  <div>
                    <p className="text-theme-ivory/60">Contact Method</p>
                    <p className="text-theme-ivory capitalize">
                      {selectedItem.preferredContactMethod || '—'}
                    </p>
                  </div>
                </div>
              </div>


              <div>
                <h3 className="mb-3 font-semibold text-theme-ivory">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-theme-ivory/60">Product</p>
                    <p className="text-theme-ivory">{selectedItem.productName}</p>
                  </div>
                  <div>
                    <p className="text-theme-ivory/60">Quantity</p>
                    <p className="text-theme-ivory">{selectedItem.quantity}</p>
                  </div>
                  <div>
                    <p className="text-theme-ivory/60">Material</p>
                    <p className="text-theme-ivory">{selectedItem.selectedMaterial || '—'}</p>
                  </div>
                  <div>
                    <p className="text-theme-ivory/60">Finish</p>
                    <p className="text-theme-ivory">{selectedItem.selectedFinish || '—'}</p>
                  </div>
                </div>
              </div>


              <div>
                <h3 className="mb-3 font-semibold text-theme-ivory">Color Selection</h3>
                {selectedItem.selectedFeaturedColor && (
                  <div className="flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded-lg border border-theme-bronze/20 shadow-lg"
                      style={{
                        backgroundColor: selectedItem.selectedFeaturedColor.hex,
                      }}
                    />
                    <div className="text-sm">
                      <p className="text-theme-ivory/60">Featured Color</p>
                      <p className="text-theme-ivory font-semibold">
                        {selectedItem.selectedFeaturedColor.name}
                      </p>
                      <p className="text-xs text-theme-bronze">{selectedItem.selectedFeaturedColor.hex}</p>
                    </div>
                  </div>
                )}
                {selectedItem.customColorName && (
                  <div className="mt-4 text-sm">
                    <p className="text-theme-ivory/60">Custom Color Request</p>
                    <p className="text-theme-ivory font-semibold">{selectedItem.customColorName}</p>
                    <p className="text-xs text-theme-bronze">{selectedItem.customColorCode}</p>
                  </div>
                )}
              </div>


              {selectedItem.selectedAddons?.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-theme-ivory">Add-ons</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.selectedAddons.map((addon: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-full bg-theme-bronze/20 px-3 py-1 text-xs text-theme-bronze"
                      >
                        {addon}
                      </span>
                    ))}
                  </div>
                </div>
              )}


              {selectedItem.customDescription && (
                <div>
                  <h3 className="mb-3 font-semibold text-theme-ivory">Custom Notes</h3>
                  <p className="rounded-lg border border-theme-bronze/20 bg-white/5 p-4 text-sm text-theme-ivory">
                    {selectedItem.customDescription}
                  </p>
                </div>
              )}


              <div>
                <h3 className="mb-3 font-semibold text-theme-ivory">Delivery Preferences</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-theme-ivory/60">Preferred Time</p>
                    <p className="text-theme-ivory">{selectedItem.preferredCallTime || '—'}</p>
                  </div>
                  <div>
                    <p className="text-theme-ivory/60">Expected Timeline</p>
                    <p className="text-theme-ivory">{selectedItem.expectedTimeline || '—'}</p>
                  </div>
                </div>
              </div>


              <div className="rounded-lg border border-theme-bronze/20 bg-theme-bronze/5 p-4 text-xs">
                <p className="text-theme-ivory/60">
                  Submitted: {new Date(selectedItem.createdAt).toLocaleDateString()}
                </p>
                {selectedItem.contactedAt && (
                  <p className="text-theme-ivory/60">
                    Contacted: {new Date(selectedItem.contactedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>


            <div className="mt-8 border-t border-theme-bronze/20 pt-6">
              <h3 className="mb-4 font-semibold text-theme-ivory">Update Status</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {['pending', 'in-review', 'approved', 'contacted', 'completed', 'rejected'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedItem._id, status)}
                      disabled={updatingStatus || selectedItem.status === status}
                      className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                        selectedItem.status === status
                          ? 'border-theme-bronze bg-theme-bronze/20 text-theme-bronze cursor-default'
                          : 'border-theme-bronze/20 bg-white/5 text-theme-ivory hover:border-theme-bronze/60 disabled:opacity-50'
                      }`}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>


            <button
              onClick={() => setSelectedItem(null)}
              className="mt-6 w-full rounded-lg bg-theme-bronze px-4 py-3 font-semibold text-white hover:bg-theme-bronze/90 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
