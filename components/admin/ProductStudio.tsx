'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Pencil,
  PlusCircle,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AdminProduct, downloadCsv, formatCurrency } from '@/lib/adminDashboard';

interface ColorEntry {
  name: string;
  image: string;
}

interface ProductForm {
  name: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  eyebrow: string;
  modelPath: string;
  images: string;
  colors: ColorEntry[];
  specs: {
    material: string;
    foam: string;
    dimensions: string;
    weight: string;
    warranty: string;
  };
}

const emptyForm: ProductForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  eyebrow: '',
  modelPath: '',
  images: '',
  colors: [{ name: '', image: '' }],
  specs: { material: '', foam: '', dimensions: '', weight: '', warranty: '' },
};

const categories = ['all', 'sofa', 'chair', 'recliner', 'pouffe'];

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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [apiError, setApiError] = useState('');

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch =
        !query ||
        [product.name, product.category, product.description, product.eyebrow]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setApiError('');
  };

  const openEdit = (product: AdminProduct) => {
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock ?? 0),
      imageUrl: product.imageUrl,
      eyebrow: product.eyebrow,
      modelPath: product.modelPath || '',
      images: product.images.join(', '),
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
  };

  const handleDelete = async (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length} product${ids.length !== 1 ? 's' : ''}?`)) return;
    await Promise.all(
      ids.map((id) => fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' }))
    );
    setSelectedIds([]);
    await onRefresh();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setApiError('');

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim(),
      eyebrow: form.eyebrow.trim(),
      modelPath: form.modelPath.trim() || null,
      images: form.images.split(',').map((entry) => entry.trim()).filter(Boolean),
      colors: form.colors.filter((entry) => entry.name.trim() && entry.image.trim()),
      specs: {
        material: form.specs.material.trim(),
        ...(form.specs.foam.trim() ? { foam: form.specs.foam.trim() } : {}),
        dimensions: form.specs.dimensions.trim(),
        weight: form.specs.weight.trim(),
        warranty: form.specs.warranty.trim(),
      },
    };

    try {
      const response = await fetch(editingId ? `/api/products/${editingId}` : '/api/products', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save product');

      resetForm();
      setShowForm(false);
      await onRefresh();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
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
                }))
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 dark:text-theme-ivory/64"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={showForm ? () => { setShowForm(false); resetForm(); } : () => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-full bg-theme-bronze px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-ink"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
            {showForm ? 'Close' : 'Add Product'}
          </button>
        </div>
      </div>

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
          onChange={(event) => setCategoryFilter(event.target.value)}
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
        <form onSubmit={handleSubmit} className="mb-8 rounded-[2rem] border border-theme-line/50 bg-white/74 p-6 shadow-[0_20px_60px_rgba(49,30,21,0.07)] dark:bg-white/5">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                {editingId ? 'Update Entry' : 'Create Entry'}
              </p>
              <h3 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
                {editingId ? 'Edit Product' : 'New Product'}
              </h3>
            </div>
            {form.imageUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-[1rem] border border-theme-line/50">
                <Image src={form.imageUrl} alt="Preview" fill className="object-cover" sizes="80px" />
              </div>
            ) : null}
          </div>

          {apiError ? (
            <div className="mb-5 rounded-[1.2rem] border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className={labelClass()}>Product Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass()}>
                <option value="">Select category</option>
                {categories.filter((entry) => entry !== 'all').map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass()}>Eyebrow</label>
              <input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Price</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass()} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass()}>Main Image</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputClass()} />
            </div>
            <div className="lg:col-span-3">
              <label className={labelClass()}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`resize-none ${inputClass()}`} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass()}>Gallery Images</label>
              <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={2} className={`resize-none ${inputClass()}`} />
            </div>
            <div>
              <label className={labelClass()}>3D Model</label>
              <input value={form.modelPath} onChange={(e) => setForm({ ...form, modelPath: e.target.value })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Material</label>
              <input value={form.specs.material} onChange={(e) => setForm({ ...form, specs: { ...form.specs, material: e.target.value } })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Foam / Fill</label>
              <input value={form.specs.foam} onChange={(e) => setForm({ ...form, specs: { ...form.specs, foam: e.target.value } })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Dimensions</label>
              <input value={form.specs.dimensions} onChange={(e) => setForm({ ...form, specs: { ...form.specs, dimensions: e.target.value } })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Weight</label>
              <input value={form.specs.weight} onChange={(e) => setForm({ ...form, specs: { ...form.specs, weight: e.target.value } })} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass()}>Warranty</label>
              <input value={form.specs.warranty} onChange={(e) => setForm({ ...form, specs: { ...form.specs, warranty: e.target.value } })} className={inputClass()} />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Color Variants</p>
              <button type="button" onClick={() => setForm({ ...form, colors: [...form.colors, { name: '', image: '' }] })} className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-bronze">
                Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {form.colors.map((color, index) => (
                <div key={`${index}-${color.name}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input value={color.name} onChange={(e) => setForm({ ...form, colors: form.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: e.target.value } : entry) })} className={inputClass()} placeholder="Olive Velvet" />
                  <input value={color.image} onChange={(e) => setForm({ ...form, colors: form.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, image: e.target.value } : entry) })} className={inputClass()} placeholder="/products/sofa/olive.png" />
                  {form.colors.length > 1 ? (
                    <button type="button" onClick={() => setForm({ ...form, colors: form.colors.filter((_, entryIndex) => entryIndex !== index) })} className="rounded-2xl border border-red-200/70 px-4 py-3 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving' : editingId ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-full border border-theme-line/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/68">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <div key={product._id} className="overflow-hidden rounded-[1.8rem] border border-theme-line/50 bg-white/76 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5">
            <div className="flex flex-wrap items-center gap-4 p-5">
              <input type="checkbox" checked={selectedIds.includes(product._id)} onChange={() => setSelectedIds((current) => current.includes(product._id) ? current.filter((id) => id !== product._id) : [...current, product._id])} />
              <div className="relative h-16 w-16 overflow-hidden rounded-[1rem] border border-theme-line/50">
                <Image src={product.imageUrl} alt={product.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">{product.name}</p>
                <p className="mt-1 text-xs text-theme-walnut/60 dark:text-theme-ivory/56">{product.category} · {product.eyebrow}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{formatCurrency(product.price)}</div>
                <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">Stock {product.stock ?? 0}</div>
                <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{product.colors.length} variants</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setExpandedId(expandedId === product._id ? null : product._id)} className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  {expandedId === product._id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  Details
                </button>
                <button onClick={() => openEdit(product)} className="inline-flex items-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button onClick={() => handleDelete([product._id])} className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>

            {expandedId === product._id ? (
              <div className="border-t border-theme-line/50 bg-theme-ivory/52 px-5 py-5 dark:bg-white/5">
                <div className="grid gap-5 lg:grid-cols-3">
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">Description</p>
                    <p className="mt-2 text-sm leading-7 text-theme-walnut/72 dark:text-theme-ivory/64">{product.description}</p>
                  </div>
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">Specifications</p>
                    <div className="mt-2 space-y-1 text-sm text-theme-walnut/72 dark:text-theme-ivory/64">
                      <p>Material: {product.specs.material}</p>
                      {product.specs.foam ? <p>Fill: {product.specs.foam}</p> : null}
                      <p>Dimensions: {product.specs.dimensions}</p>
                      <p>Weight: {product.specs.weight}</p>
                      <p>Warranty: {product.specs.warranty}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-theme-bronze">Variants</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.colors.map((color, index) => (
                        <span key={`${color.name}-${index}`} className="rounded-full border border-theme-line/50 px-3 py-1 text-xs text-theme-walnut/68 dark:text-theme-ivory/62">
                          {color.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
