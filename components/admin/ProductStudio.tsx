'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Pencil,
  PlusCircle,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  extractAdditionalGalleryImages,
  isProductCategory,
  prepareProductMutationInput,
  PRODUCT_CATEGORIES,
  type ProductColorEntry,
  type ProductMediaViews,
  type ProductViewKey,
} from '@/lib/productCatalog';
import type { AdminProduct } from '@/lib/adminDashboard';
import { downloadCsv, formatCurrency } from '@/lib/adminDashboard';

type ProductForm = {
  name: string;
  category: '' | (typeof PRODUCT_CATEGORIES)[number];
  description: string;
  price: string;
  stock: string;
  eyebrow: string;
  modelPath: string;
  views: Record<ProductViewKey, string>;
  gallery: string[];
  colors: ProductColorEntry[];
  specs: {
    material: string;
    foam: string;
    dimensions: string;
    weight: string;
    warranty: string;
  };
};

const categories = ['all', ...PRODUCT_CATEGORIES] as const;
const viewCards: Array<{ key: ProductViewKey; label: string; hint: string }> = [
  { key: 'main', label: 'Main View', hint: 'Primary storefront image' },
  { key: 'cover', label: 'Cover View', hint: 'Front angle or lifestyle cover' },
  { key: 'left', label: 'Left View', hint: 'Left profile upload' },
  { key: 'right', label: 'Right View', hint: 'Right profile upload' },
  { key: 'top', label: 'Top View', hint: 'Top-down or overview image' },
  { key: 'detail', label: 'Detail View', hint: 'Legs, texture, or close-up' },
];

function createEmptyViews(): Record<ProductViewKey, string> {
  return {
    main: '',
    cover: '',
    left: '',
    right: '',
    top: '',
    detail: '',
  };
}

const emptyForm: ProductForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  stock: '0',
  eyebrow: '',
  modelPath: '',
  views: createEmptyViews(),
  gallery: [],
  colors: [{ name: '', image: '' }],
  specs: {
    material: '',
    foam: '',
    dimensions: '',
    weight: '',
    warranty: '',
  },
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

function AssetPreview({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-dashed border-theme-line/60 bg-theme-ivory/45 text-center text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut/45 dark:bg-white/5 dark:text-theme-ivory/35">
        No asset
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-[1.25rem] border border-theme-line/50 bg-white/70">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function UploadButton({
  busy,
  accept,
  onSelect,
  label = 'Upload',
}: {
  busy: boolean;
  accept: string;
  onSelect: (file: File) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/6 dark:text-theme-ivory/68">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
      {busy ? 'Uploading' : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={busy}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            onSelect(file);
          }
          event.currentTarget.value = '';
        }}
      />
    </label>
  );
}

function buildViewState(views?: Partial<ProductMediaViews> | null) {
  return {
    ...createEmptyViews(),
    ...(views?.main ? { main: views.main } : {}),
    ...(views?.cover ? { cover: views.cover } : {}),
    ...(views?.left ? { left: views.left } : {}),
    ...(views?.right ? { right: views.right } : {}),
    ...(views?.top ? { top: views.top } : {}),
    ...(views?.detail ? { detail: views.detail } : {}),
  };
}

export default function ProductStudio({
  products,
  onRefresh,
}: {
  products: AdminProduct[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<(typeof categories)[number]>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesSearch =
          !query ||
          [product.name, product.category, product.description, product.eyebrow]
            .join(' ')
            .toLowerCase()
            .includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name));
  }, [products, search, categoryFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setApiError('');
    setSuccessMessage('');
  };

  const openEdit = (product: AdminProduct) => {
    setForm({
      name: product.name,
      category: isProductCategory(product.category) ? product.category : '',
      description: product.description,
      price: String(product.price),
      stock: String(product.stock ?? 0),
      eyebrow: product.eyebrow,
      modelPath: product.modelPath || '',
      views: buildViewState(product.media?.views),
      gallery: extractAdditionalGalleryImages(product),
      colors: product.colors.length ? product.colors : [{ name: '', image: '' }],
      specs: {
        material: product.specs.material,
        foam: product.specs.foam || '',
        dimensions: product.specs.dimensions,
        weight: product.specs.weight,
        warranty: product.specs.warranty,
      },
    });
    setEditingId(product._id);
    setShowForm(true);
    setApiError('');
    setSuccessMessage('');
  };

  const uploadAsset = async ({
    file,
    slot,
    kind = 'image',
  }: {
    file: File;
    slot: string;
    kind?: 'image' | 'model';
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slot', slot);
    formData.append('kind', kind);
    formData.append('category', form.category || 'general');
    formData.append('productName', form.name || 'draft-product');

    const response = await fetch('/api/admin/uploads', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Upload failed');
    }

    return String(data.path || '');
  };

  const handleViewUpload = async (viewKey: ProductViewKey, file: File) => {
    setUploadingKey(`view-${viewKey}`);
    setApiError('');

    try {
      const uploadedPath = await uploadAsset({ file, slot: viewKey });
      setForm((current) => ({
        ...current,
        views: {
          ...current.views,
          [viewKey]: uploadedPath,
        },
      }));
      setSuccessMessage(`${viewCards.find((card) => card.key === viewKey)?.label || 'Image'} uploaded.`);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleGalleryUpload = async (file: File) => {
    setUploadingKey('gallery');
    setApiError('');

    try {
      const uploadedPath = await uploadAsset({
        file,
        slot: `gallery-${form.gallery.length + 1}`,
      });
      setForm((current) => ({
        ...current,
        gallery: [...current.gallery, uploadedPath],
      }));
      setSuccessMessage('Gallery image uploaded.');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleColorUpload = async (index: number, file: File) => {
    setUploadingKey(`color-${index}`);
    setApiError('');

    try {
      const uploadedPath = await uploadAsset({
        file,
        slot: `color-${index + 1}`,
      });
      setForm((current) => ({
        ...current,
        colors: current.colors.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, image: uploadedPath } : entry
        ),
      }));
      setSuccessMessage('Color swatch uploaded.');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleModelUpload = async (file: File) => {
    setUploadingKey('model');
    setApiError('');

    try {
      const uploadedPath = await uploadAsset({
        file,
        slot: 'model',
        kind: 'model',
      });
      setForm((current) => ({
        ...current,
        modelPath: uploadedPath,
      }));
      setSuccessMessage('3D model uploaded.');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length} product${ids.length !== 1 ? 's' : ''}?`)) {
      return;
    }

    setApiError('');
    setSuccessMessage('');

    const responses = await Promise.all(
      ids.map(async (id) => {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Delete failed');
        }

        return response;
      })
    ).catch((error: Error) => {
      setApiError(error.message);
      return null;
    });

    if (!responses) {
      return;
    }

    setSelectedIds([]);
    setSuccessMessage(`Deleted ${ids.length} product${ids.length !== 1 ? 's' : ''}.`);
    await onRefresh();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const payload = prepareProductMutationInput({
        name: form.name,
        category: form.category,
        description: form.description,
        price: form.price,
        stock: form.stock,
        eyebrow: form.eyebrow,
        modelPath: form.modelPath,
        media: {
          views: form.views,
          gallery: form.gallery,
        },
        colors: form.colors,
        specs: form.specs,
      });

      const response = await fetch(editingId ? `/api/products/${editingId}` : '/api/products', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save product');
      }

      resetForm();
      setShowForm(false);
      setSuccessMessage(editingId ? 'Product updated successfully.' : 'Product created successfully.');
      await onRefresh();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const completedViewCount = viewCards.filter((card) => form.views[card.key]).length;

  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
            Catalogue Studio
          </p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
            Product Management
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
            Manage live storefront products, upload named product views, attach 3D models, and keep
            color variants in sync with the site.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              downloadCsv(
                'luxe-products.csv',
                filteredProducts.map((product) => ({
                  name: product.name,
                  category: product.category,
                  price: product.price,
                  stock: product.stock ?? 0,
                  mainImage: product.media?.views?.main || product.imageUrl,
                  modelPath: product.modelPath || '',
                }))
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={
              showForm
                ? () => {
                    setShowForm(false);
                    resetForm();
                  }
                : () => setShowForm(true)
            }
            className="inline-flex items-center gap-2 rounded-full bg-theme-bronze px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-ink"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
            {showForm ? 'Close' : 'Add Product'}
          </button>
        </div>
      </div>

      {apiError ? (
        <div className="mb-5 flex items-center gap-3 rounded-[1.2rem] border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {apiError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-5 flex items-center gap-3 rounded-[1.2rem] border border-emerald-400/30 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      ) : null}

      <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
        <div className="flex items-center gap-3 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5">
          <Search className="h-4 w-4 text-theme-bronze" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as (typeof categories)[number])}
          className="rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All categories' : category}
            </option>
          ))}
        </select>
        {selectedIds.length > 0 ? (
          <button
            onClick={() => handleDelete(selectedIds)}
            className="rounded-full border border-red-300/70 bg-red-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-red-600"
          >
            Delete Selected
          </button>
        ) : null}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-[2rem] border border-theme-line/50 bg-white/74 p-6 shadow-[0_20px_60px_rgba(49,30,21,0.07)] dark:bg-white/5"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                {editingId ? 'Update Entry' : 'Create Entry'}
              </p>
              <h3 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
                {editingId ? 'Edit Product' : 'New Product'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-theme-line/60 bg-theme-ivory/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut/68 dark:bg-white/6 dark:text-theme-ivory/62">
                {completedViewCount} / {viewCards.length} named views ready
              </div>
              <div className="rounded-full border border-theme-line/60 bg-theme-ivory/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-theme-walnut/68 dark:bg-white/6 dark:text-theme-ivory/62">
                {form.colors.filter((entry) => entry.name && entry.image).length} color variants
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className={labelClass()}>Product Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={inputClass()}
              />
            </div>
            <div>
              <label className={labelClass()}>Category</label>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as ProductForm['category'],
                  }))
                }
                className={inputClass()}
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass()}>Eyebrow</label>
              <input
                value={form.eyebrow}
                onChange={(event) =>
                  setForm((current) => ({ ...current, eyebrow: event.target.value }))
                }
                className={inputClass()}
              />
            </div>
            <div>
              <label className={labelClass()}>Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className={inputClass()}
              />
            </div>
            <div>
              <label className={labelClass()}>Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                className={inputClass()}
              />
            </div>
            <div className="lg:col-span-3">
              <label className={labelClass()}>Description</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={3}
                className={`resize-none ${inputClass()}`}
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                  Image Views
                </p>
                <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">
                  Upload named product angles so the storefront gallery has stable main, cover, left,
                  right, top, and detail images.
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {viewCards.map((card) => (
                <div
                  key={card.key}
                  className="rounded-[1.5rem] border border-theme-line/50 bg-theme-ivory/45 p-4 dark:bg-white/4"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                        {card.label}
                      </p>
                      <p className="mt-1 text-xs text-theme-walnut/56 dark:text-theme-ivory/50">
                        {card.hint}
                      </p>
                    </div>
                    {form.views[card.key] ? (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            views: { ...current.views, [card.key]: '' },
                          }))
                        }
                        className="rounded-full border border-theme-line/60 p-2 text-theme-walnut/50 transition hover:text-red-500 dark:text-theme-ivory/50"
                        aria-label={`Clear ${card.label}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <div className="h-40">
                    <AssetPreview src={form.views[card.key]} alt={card.label} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <UploadButton
                      busy={uploadingKey === `view-${card.key}`}
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onSelect={(file) => handleViewUpload(card.key, file)}
                    />
                  </div>
                  <div className="mt-3">
                    <input
                      value={form.views[card.key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          views: { ...current.views, [card.key]: event.target.value },
                        }))
                      }
                      className={inputClass()}
                      placeholder="Paste image URL or upload"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                    Additional Gallery
                  </p>
                  <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">
                    Add any extra product shots beyond the named views.
                  </p>
                </div>
                <UploadButton
                  busy={uploadingKey === 'gallery'}
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onSelect={handleGalleryUpload}
                  label="Upload Image"
                />
              </div>
              <div className="mt-4 space-y-3">
                {form.gallery.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-theme-line/60 px-4 py-6 text-center text-sm text-theme-walnut/55 dark:text-theme-ivory/50">
                    No extra gallery images added yet.
                  </div>
                ) : null}
                {form.gallery.map((image, index) => (
                  <div key={`${image}-${index}`} className="grid gap-3 md:grid-cols-[120px_1fr_auto]">
                    <div className="h-24">
                      <AssetPreview src={image} alt={`Gallery ${index + 1}`} />
                    </div>
                    <input
                      value={image}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          gallery: current.gallery.map((entry, entryIndex) =>
                            entryIndex === index ? event.target.value : entry
                          ),
                        }))
                      }
                      className={inputClass()}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          gallery: current.gallery.filter((_, entryIndex) => entryIndex !== index),
                        }))
                      }
                      className="rounded-2xl border border-red-200/70 px-4 py-3 text-red-500"
                      aria-label="Remove gallery image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                    3D Model Asset
                  </p>
                  <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">
                    Upload a GLB or GLTF file for the interactive viewer.
                  </p>
                </div>
                {form.modelPath ? (
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, modelPath: '' }))}
                    className="rounded-full border border-theme-line/60 p-2 text-theme-walnut/50 transition hover:text-red-500 dark:text-theme-ivory/50"
                    aria-label="Clear model path"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <div className="mt-4 rounded-[1.25rem] border border-theme-line/60 bg-white/65 px-4 py-4 text-sm text-theme-walnut/70 dark:bg-white/5 dark:text-theme-ivory/64">
                <div className="flex items-center gap-3">
                  <Box className="h-4 w-4 text-theme-bronze" />
                  <span className="truncate">{form.modelPath || 'No model uploaded yet.'}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <UploadButton
                  busy={uploadingKey === 'model'}
                  accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                  onSelect={handleModelUpload}
                  label="Upload Model"
                />
              </div>
              <div className="mt-3">
                <input
                  value={form.modelPath}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, modelPath: event.target.value }))
                  }
                  className={inputClass()}
                  placeholder="/uploads/products/.../model.glb"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                    Color Variants
                  </p>
                  <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">
                    Each color entry can have its own swatch image.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      colors: [...current.colors, { name: '', image: '' }],
                    }))
                  }
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-bronze"
                >
                  Add Variant
                </button>
              </div>
              <div className="space-y-4">
                {form.colors.map((color, index) => (
                  <div
                    key={`${index}-${color.name}`}
                    className="rounded-[1.25rem] border border-theme-line/50 bg-white/70 p-4 dark:bg-white/5"
                  >
                    <div className="grid gap-4 md:grid-cols-[96px_1fr]">
                      <div className="h-24">
                        <AssetPreview src={color.image} alt={color.name || `Color ${index + 1}`} />
                      </div>
                      <div className="space-y-3">
                        <input
                          value={color.name}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              colors: current.colors.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, name: event.target.value } : entry
                              ),
                            }))
                          }
                          className={inputClass()}
                          placeholder="Olive Velvet"
                        />
                        <input
                          value={color.image}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              colors: current.colors.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, image: event.target.value } : entry
                              ),
                            }))
                          }
                          className={inputClass()}
                          placeholder="/uploads/products/.../color.png"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <UploadButton
                        busy={uploadingKey === `color-${index}`}
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        onSelect={(file) => handleColorUpload(index, file)}
                        label="Upload Swatch"
                      />
                      {form.colors.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              colors: current.colors.filter((_, entryIndex) => entryIndex !== index),
                            }))
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-red-200/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                Specifications
              </p>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className={labelClass()}>Material</label>
                  <input
                    value={form.specs.material}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        specs: { ...current.specs, material: event.target.value },
                      }))
                    }
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Foam / Fill</label>
                  <input
                    value={form.specs.foam}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        specs: { ...current.specs, foam: event.target.value },
                      }))
                    }
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Dimensions</label>
                  <input
                    value={form.specs.dimensions}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        specs: { ...current.specs, dimensions: event.target.value },
                      }))
                    }
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Weight</label>
                  <input
                    value={form.specs.weight}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        specs: { ...current.specs, weight: event.target.value },
                      }))
                    }
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className={labelClass()}>Warranty</label>
                  <input
                    value={form.specs.warranty}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        specs: { ...current.specs, warranty: event.target.value },
                      }))
                    }
                    className={inputClass()}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving' : editingId ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-full border border-theme-line/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const assetCoverage = viewCards.filter((card) => product.media?.views?.[card.key]).length;

          return (
            <div
              key={product._id}
              className="overflow-hidden rounded-[1.8rem] border border-theme-line/50 bg-white/76 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-4 p-5">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product._id)}
                  onChange={() =>
                    setSelectedIds((current) =>
                      current.includes(product._id)
                        ? current.filter((id) => id !== product._id)
                        : [...current, product._id]
                    )
                  }
                />
                <div className="h-16 w-16 overflow-hidden rounded-[1rem] border border-theme-line/50">
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-[220px] flex-1">
                  <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-theme-walnut/60 dark:text-theme-ivory/56">
                    {product.category} | {product.eyebrow}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    {formatCurrency(product.price)}
                  </div>
                  <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    Stock {product.stock ?? 0}
                  </div>
                  <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    {product.colors.length} colors
                  </div>
                  <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                    {assetCoverage}/{viewCards.length} views
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === product._id ? null : product._id)}
                    className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    {expandedId === product._id ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    Details
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete([product._id])}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === product._id ? (
                <div className="border-t border-theme-line/50 bg-theme-ivory/52 px-5 py-5 dark:bg-white/5">
                  <div className="grid gap-5 lg:grid-cols-3">
                    <div>
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">
                        Description
                      </p>
                      <p className="mt-2 text-sm leading-7 text-theme-walnut/72 dark:text-theme-ivory/64">
                        {product.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">
                        Specifications
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-theme-walnut/72 dark:text-theme-ivory/64">
                        <p>Material: {product.specs.material}</p>
                        {product.specs.foam ? <p>Fill: {product.specs.foam}</p> : null}
                        <p>Dimensions: {product.specs.dimensions}</p>
                        <p>Weight: {product.specs.weight}</p>
                        <p>Warranty: {product.specs.warranty}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">
                        Asset Readiness
                      </p>
                      <div className="mt-2 space-y-2 text-sm text-theme-walnut/72 dark:text-theme-ivory/64">
                        {viewCards.map((card) => (
                          <div key={card.key} className="flex items-center justify-between gap-4">
                            <span>{card.label}</span>
                            <span className={product.media?.views?.[card.key] ? 'text-emerald-600' : 'text-theme-walnut/45 dark:text-theme-ivory/40'}>
                              {product.media?.views?.[card.key] ? 'Ready' : 'Missing'}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between gap-4">
                          <span>3D Model</span>
                          <span className={product.modelPath ? 'text-emerald-600' : 'text-theme-walnut/45 dark:text-theme-ivory/40'}>
                            {product.modelPath ? 'Ready' : 'Missing'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
