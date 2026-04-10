'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
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
import type { CatalogOptionsResponse } from '@/lib/catalogEntities';
import {
  extractAdditionalGalleryImages,
  prepareProductMutationInput,
  type ProductColorEntry,
  type ProductViewKey,
} from '@/lib/productCatalog';
import type { AdminProduct } from '@/lib/adminDashboard';
import { downloadCsv, formatCurrency } from '@/lib/adminDashboard';
import { getApiUrl } from '@/lib/api/browser';

type ProductForm = {
  name: string;
  description: string;
  mainCategoryId: string;
  subCategoryId: string;
  brandId: string;
  eyebrow: string;
  basePrice: string;
  discount: string;
  finalPrice: string;
  stockQuantity: string;
  inStock: boolean;
  active: boolean;
  sizeInput: string;
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

const VIEW_KEYS: ProductViewKey[] = ['main', 'cover', 'left', 'right', 'top', 'detail'];

function emptyForm(): ProductForm {
  return {
    name: '',
    description: '',
    mainCategoryId: '',
    subCategoryId: '',
    brandId: '',
    eyebrow: '',
    basePrice: '',
    discount: '0',
    finalPrice: '',
    stockQuantity: '0',
    inStock: true,
    active: true,
    sizeInput: '',
    modelPath: '',
    views: { main: '', cover: '', left: '', right: '', top: '', detail: '' },
    gallery: [],
    colors: [{ name: '', image: '' }],
    specs: { material: '', foam: '', dimensions: '', weight: '', warranty: '' },
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

function UploadButton({
  busy,
  accept,
  label,
  onSelect,
}: {
  busy: boolean;
  accept: string;
  label: string;
  onSelect: (file: File) => void;
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
          if (file) onSelect(file);
          event.currentTarget.value = '';
        }}
      />
    </label>
  );
}

function optionName(options: CatalogOptionsResponse[keyof CatalogOptionsResponse], id: string) {
  return options.find((entry) => entry._id === id)?.name || '';
}

export default function ProductStudio({
  products,
  catalogOptions,
  onRefresh,
}: {
  products: AdminProduct[];
  catalogOptions: CatalogOptionsResponse;
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [mainCategoryFilter, setMainCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...products]
      .filter((product) => {
        const matchesFilter =
          mainCategoryFilter === 'all' || product.mainCategoryId === mainCategoryFilter;
        const text = [
          product.name,
          product.description,
          product.mainCategoryName,
          product.subCategoryName,
          product.brandName,
          product.category,
        ]
          .join(' ')
          .toLowerCase();
        return matchesFilter && (!query || text.includes(query));
      })
      .sort((a, b) => (a.mainCategoryName || a.category).localeCompare(b.mainCategoryName || b.category) || a.name.localeCompare(b.name));
  }, [products, search, mainCategoryFilter]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setApiError('');
    setSuccessMessage('');
  };

  const setView = (key: ProductViewKey, value: string) =>
    setForm((current) => ({ ...current, views: { ...current.views, [key]: value } }));

  const uploadAsset = async (file: File, slot: string, kind: 'image' | 'model' = 'image') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slot', slot);
    fd.append('kind', kind);
    fd.append('category', optionName(catalogOptions.mainCategories, form.mainCategoryId) || form.name || 'general');
    fd.append('productName', form.name || 'draft-product');
    const response = await fetch(getApiUrl('/api/admin/uploads'), {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || 'Upload failed');
    return String(data?.path || '');
  };

  const handleUpload = async (key: string, callback: (path: string) => void, file: File, kind: 'image' | 'model' = 'image') => {
    setUploadingKey(key);
    setApiError('');
    try {
      const path = await uploadAsset(file, key, kind);
      callback(path);
      setSuccessMessage('Asset uploaded.');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const openEdit = (product: AdminProduct) => {
    setForm({
      name: product.name,
      description: product.description,
      mainCategoryId: product.mainCategoryId || product.mainCategory?._id || '',
      subCategoryId: product.subCategoryId || product.subCategory?._id || '',
      brandId: product.brandId || product.brand?._id || '',
      eyebrow: product.eyebrow || '',
      basePrice: String(product.basePrice ?? product.price),
      discount: String(product.discount ?? 0),
      finalPrice: String(product.finalPrice ?? product.price),
      stockQuantity: String(product.stockQuantity ?? product.stock ?? 0),
      inStock: product.inStock ?? (product.stockQuantity ?? product.stock ?? 0) > 0,
      active: product.active ?? true,
      sizeInput: (product.size || []).join(', '),
      modelPath: product.modelPath || '',
      views: {
        main: product.media?.views?.main || '',
        cover: product.media?.views?.cover || '',
        left: product.media?.views?.left || '',
        right: product.media?.views?.right || '',
        top: product.media?.views?.top || '',
        detail: product.media?.views?.detail || '',
      },
      gallery: extractAdditionalGalleryImages(product),
      colors: product.colors?.length ? product.colors : [{ name: '', image: '' }],
      specs: {
        material: product.specs?.material || '',
        foam: product.specs?.foam || '',
        dimensions: product.specs?.dimensions || '',
        weight: product.specs?.weight || '',
        warranty: product.specs?.warranty || '',
      },
    });
    setEditingId(product._id);
    setShowForm(true);
    setApiError('');
    setSuccessMessage('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    setApiError('');
    const response = await fetch(getApiUrl(`/api/products/${id}`), {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setApiError(data?.error || 'Delete failed');
      return;
    }
    setSuccessMessage('Product deleted.');
    await onRefresh();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setApiError('');
    setSuccessMessage('');
    try {
      if (!form.mainCategoryId || !form.subCategoryId || !form.brandId) {
        throw new Error('Please select a main category, subcategory, and brand.');
      }

      const payload = prepareProductMutationInput({
        name: form.name,
        description: form.description,
        mainCategory: form.mainCategoryId,
        subCategory: form.subCategoryId,
        brand: form.brandId,
        mainCategoryName: optionName(catalogOptions.mainCategories, form.mainCategoryId),
        subCategoryName: optionName(catalogOptions.subCategories, form.subCategoryId),
        brandName: optionName(catalogOptions.brands, form.brandId),
        eyebrow: form.eyebrow,
        basePrice: form.basePrice,
        discount: form.discount,
        finalPrice: form.finalPrice,
        stockQuantity: form.stockQuantity,
        inStock: form.inStock,
        active: form.active,
        size: form.sizeInput.split(',').map((entry) => entry.trim()).filter(Boolean),
        modelPath: form.modelPath,
        media: { views: form.views, gallery: form.gallery },
        colors: form.colors,
        specs: form.specs,
      });

      const wasEditing = Boolean(editingId);
      const response = await fetch(getApiUrl(editingId ? `/api/products/${editingId}` : '/api/products'), {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Failed to save product');

      resetForm();
      setShowForm(false);
      setSuccessMessage(wasEditing ? 'Product updated.' : 'Product created.');
      await onRefresh();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Catalogue Studio</p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">Product Management</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
            Products now use linked main categories, subcategories, and brands.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              downloadCsv(
                'catalog-products.csv',
                filteredProducts.map((product) => ({
                  name: product.name,
                  mainCategory: product.mainCategoryName || '',
                  subCategory: product.subCategoryName || '',
                  brand: product.brandName || '',
                  price: product.finalPrice ?? product.price,
                  stock: product.stockQuantity ?? product.stock ?? 0,
                }))
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => {
              if (showForm) resetForm();
              setShowForm((current) => !current);
            }}
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

      <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
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
          value={mainCategoryFilter}
          onChange={(event) => setMainCategoryFilter(event.target.value)}
          className="rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
        >
          <option value="all">All main categories</option>
          {catalogOptions.mainCategories.map((entry) => (
            <option key={entry._id} value={entry._id}>{entry.name}</option>
          ))}
        </select>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="mb-8 rounded-[2rem] border border-theme-line/50 bg-white/74 p-6 shadow-[0_20px_60px_rgba(49,30,21,0.07)] dark:bg-white/5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass()}>Product Name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Eyebrow / Label</label>
              <input value={form.eyebrow} onChange={(event) => setForm((current) => ({ ...current, eyebrow: event.target.value }))} className={inputClass()} />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div>
              <label className={labelClass()}>Main Category</label>
              <select value={form.mainCategoryId} onChange={(event) => setForm((current) => ({ ...current, mainCategoryId: event.target.value }))} className={inputClass(!form.mainCategoryId)}>
                <option value="">Select main category</option>
                {catalogOptions.mainCategories.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass()}>Subcategory</label>
              <select value={form.subCategoryId} onChange={(event) => setForm((current) => ({ ...current, subCategoryId: event.target.value }))} className={inputClass(!form.subCategoryId)}>
                <option value="">Select subcategory</option>
                {catalogOptions.subCategories.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass()}>Brand</label>
              <select value={form.brandId} onChange={(event) => setForm((current) => ({ ...current, brandId: event.target.value }))} className={inputClass(!form.brandId)}>
                <option value="">Select brand</option>
                {catalogOptions.brands.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass()}>Description</label>
            <textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={inputClass()} />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div><label className={labelClass()}>Base Price</label><input type="number" min="0" value={form.basePrice} onChange={(event) => setForm((current) => ({ ...current, basePrice: event.target.value }))} className={inputClass()} /></div>
            <div><label className={labelClass()}>Discount (%)</label><input type="number" min="0" value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} className={inputClass()} /></div>
            <div><label className={labelClass()}>Final Price</label><input type="number" min="0" value={form.finalPrice} onChange={(event) => setForm((current) => ({ ...current, finalPrice: event.target.value }))} className={inputClass()} /></div>
            <div><label className={labelClass()}>Stock Quantity</label><input type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} className={inputClass()} /></div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-4">
            <div className="lg:col-span-2"><label className={labelClass()}>Sizes</label><input value={form.sizeInput} onChange={(event) => setForm((current) => ({ ...current, sizeInput: event.target.value }))} className={inputClass()} placeholder="3 Seater, Compact" /></div>
            <div className="flex items-center justify-between rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/45 px-5 py-4 dark:bg-white/4"><span className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">In Stock</span><button type="button" onClick={() => setForm((current) => ({ ...current, inStock: !current.inStock }))} className={`relative h-8 w-14 rounded-full transition ${form.inStock ? 'bg-theme-bronze' : 'bg-theme-sand'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${form.inStock ? 'left-7' : 'left-1'}`} /></button></div>
            <div className="flex items-center justify-between rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/45 px-5 py-4 dark:bg-white/4"><span className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">Active</span><button type="button" onClick={() => setForm((current) => ({ ...current, active: !current.active }))} className={`relative h-8 w-14 rounded-full transition ${form.active ? 'bg-theme-bronze' : 'bg-theme-sand'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${form.active ? 'left-7' : 'left-1'}`} /></button></div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Views</p>
                    <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">Main image plus optional view URLs.</p>
                  </div>
                  <UploadButton busy={uploadingKey === 'main'} accept="image/png,image/jpeg,image/webp,image/avif" label="Upload Main" onSelect={(file) => handleUpload('main', (path) => setView('main', path), file)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {VIEW_KEYS.map((key) => (
                    <div key={key}>
                      <label className={labelClass()}>{key}</label>
                      <input value={form.views[key]} onChange={(event) => setView(key, event.target.value)} className={inputClass(key === 'main' && !form.views.main)} placeholder={`/uploads/products/.../${key}.jpg`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Gallery</p>
                    <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">Extra product images.</p>
                  </div>
                  <UploadButton busy={uploadingKey === 'gallery'} accept="image/png,image/jpeg,image/webp,image/avif" label="Upload" onSelect={(file) => handleUpload('gallery', (path) => setForm((current) => ({ ...current, gallery: [...current.gallery, path] })), file)} />
                </div>
                <div className="space-y-3">
                  {form.gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input value={image} onChange={(event) => setForm((current) => ({ ...current, gallery: current.gallery.map((entry, entryIndex) => entryIndex === index ? event.target.value : entry) }))} className={inputClass()} />
                      <button type="button" onClick={() => setForm((current) => ({ ...current, gallery: current.gallery.filter((_, entryIndex) => entryIndex !== index) }))} className="rounded-2xl border border-red-200/70 px-4 py-3 text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {form.gallery.length === 0 ? <div className="rounded-[1.2rem] border border-dashed border-theme-line/60 px-4 py-5 text-center text-sm text-theme-walnut/55 dark:text-theme-ivory/50">No gallery images yet.</div> : null}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">3D Model</p>
                    <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">Optional GLB or GLTF asset.</p>
                  </div>
                  <UploadButton busy={uploadingKey === 'model'} accept=".glb,.gltf,model/gltf-binary,model/gltf+json" label="Upload" onSelect={(file) => handleUpload('model', (path) => setForm((current) => ({ ...current, modelPath: path })), file, 'model')} />
                </div>
                <input value={form.modelPath} onChange={(event) => setForm((current) => ({ ...current, modelPath: event.target.value }))} className={inputClass()} placeholder="/uploads/products/.../model.glb" />
              </div>

              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Colors</p>
                    <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">Finish names and swatch images.</p>
                  </div>
                  <button type="button" onClick={() => setForm((current) => ({ ...current, colors: [...current.colors, { name: '', image: '' }] }))} className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-bronze">Add</button>
                </div>
                <div className="space-y-3">
                  {form.colors.map((color, index) => (
                    <div key={`${index}-${color.name}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <input value={color.name} onChange={(event) => setForm((current) => ({ ...current, colors: current.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: event.target.value } : entry) }))} className={inputClass()} placeholder="Olive Velvet" />
                      <input value={color.image} onChange={(event) => setForm((current) => ({ ...current, colors: current.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, image: event.target.value } : entry) }))} className={inputClass()} placeholder="/uploads/products/.../color.png" />
                      <div className="flex gap-2">
                        <UploadButton busy={uploadingKey === `color-${index}`} accept="image/png,image/jpeg,image/webp,image/avif" label="Swatch" onSelect={(file) => handleUpload(`color-${index}`, (path) => setForm((current) => ({ ...current, colors: current.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, image: path } : entry) })), file)} />
                        {form.colors.length > 1 ? <button type="button" onClick={() => setForm((current) => ({ ...current, colors: current.colors.filter((_, entryIndex) => entryIndex !== index) }))} className="rounded-2xl border border-red-200/70 px-4 py-3 text-red-500"><Trash2 className="h-4 w-4" /></button> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Specifications</p>
                <div className="mt-4 grid gap-3">
                  <input value={form.specs.material} onChange={(event) => setForm((current) => ({ ...current, specs: { ...current.specs, material: event.target.value } }))} className={inputClass()} placeholder="Material" />
                  <input value={form.specs.foam} onChange={(event) => setForm((current) => ({ ...current, specs: { ...current.specs, foam: event.target.value } }))} className={inputClass()} placeholder="Foam / Fill" />
                  <input value={form.specs.dimensions} onChange={(event) => setForm((current) => ({ ...current, specs: { ...current.specs, dimensions: event.target.value } }))} className={inputClass()} placeholder="Dimensions" />
                  <input value={form.specs.weight} onChange={(event) => setForm((current) => ({ ...current, specs: { ...current.specs, weight: event.target.value } }))} className={inputClass()} placeholder="Weight" />
                  <input value={form.specs.warranty} onChange={(event) => setForm((current) => ({ ...current, specs: { ...current.specs, warranty: event.target.value } }))} className={inputClass()} placeholder="Warranty" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving' : editingId ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-full border border-theme-line/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68">Cancel</button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <div key={product._id} className="rounded-[1.8rem] border border-theme-line/50 bg-white/76 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-[1rem] border border-theme-line/50">
                {product.imageUrl ? (
                  <>

                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  </>
                ) : null}
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">{product.name}</p>
                <p className="mt-1 text-xs text-theme-walnut/60 dark:text-theme-ivory/56">
                  {(product.mainCategoryName || product.category) || 'Unassigned'} | {product.subCategoryName || 'No subcategory'} | {product.brandName || 'No brand'}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{formatCurrency(product.finalPrice ?? product.price)}</div>
                <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">Stock {product.stockQuantity ?? product.stock ?? 0}</div>
                <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{product.active ?? true ? 'Active' : 'Hidden'}</div>
                <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{product.colors.length} colors</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(product)} className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"><Pencil className="h-3.5 w-3.5" />Edit</button>
                <button onClick={() => handleDelete(product._id)} className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"><Trash2 className="h-3.5 w-3.5" />Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
