'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, Pencil, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ColorEntry {
  name: string;
  image: string;
}

interface ProductForm {
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
  eyebrow: string;
  modelPath: string;
  images: string; // comma-separated
  colors: ColorEntry[];
  specs: {
    material: string;
    foam: string;
    dimensions: string;
    weight: string;
    warranty: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  eyebrow: string;
  modelPath?: string;
  images: string[];
  colors: ColorEntry[];
  specs: {
    material: string;
    foam?: string;
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
  imageUrl: '',
  eyebrow: '',
  modelPath: '',
  images: '',
  colors: [{ name: '', image: '' }],
  specs: { material: '', foam: '', dimensions: '', weight: '', warranty: '' },
};

const CATEGORIES = ['sofa', 'chair', 'recliner', 'pouffe'];

function inputClass(error?: boolean) {
  return `w-full rounded-xl border px-3 py-2 text-sm text-theme-ink outline-none transition focus:ring-1 dark:bg-white/5 dark:text-theme-ivory dark:placeholder-theme-ivory/30 ${
    error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
      : 'border-theme-line/60 bg-white/60 placeholder-theme-walnut/40 focus:border-theme-bronze focus:ring-theme-bronze/30'
  }`;
}

function labelClass() {
  return 'block mb-1 text-xs font-semibold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60';
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [apiError, setApiError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ProductForm, string>> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
      e.price = 'Enter a valid price';
    if (!form.imageUrl.trim()) e.imageUrl = 'Required';
    if (!form.eyebrow.trim()) e.eyebrow = 'Required';
    if (!form.specs.material.trim()) e.specs = 'Material is required';
    if (!form.specs.dimensions.trim()) e.specs = 'Dimensions is required';
    if (!form.specs.weight.trim()) e.specs = 'Weight is required';
    if (!form.specs.warranty.trim()) e.specs = 'Warranty is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('specs.')) {
      const key = name.replace('specs.', '') as keyof ProductForm['specs'];
      setForm(prev => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const addColor = () =>
    setForm(prev => ({ ...prev, colors: [...prev.colors, { name: '', image: '' }] }));

  const removeColor = (i: number) =>
    setForm(prev => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }));

  const updateColor = (i: number, field: 'name' | 'image', value: string) =>
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setApiError('');
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      eyebrow: product.eyebrow,
      modelPath: product.modelPath || '',
      images: product.images.join(', '),
      colors: product.colors.length > 0 ? product.colors : [{ name: '', image: '' }],
      specs: {
        material: product.specs.material,
        foam: product.specs.foam || '',
        dimensions: product.specs.dimensions,
        weight: product.specs.weight,
        warranty: product.specs.warranty,
      },
    });
    setEditingId(product._id);
    setErrors({});
    setApiError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError('');

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: parseFloat(form.price),
      imageUrl: form.imageUrl.trim(),
      eyebrow: form.eyebrow.trim(),
      modelPath: form.modelPath.trim() || null,
      images: form.images
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      colors: form.colors.filter(c => c.name.trim() && c.image.trim()),
      specs: {
        material: form.specs.material.trim(),
        ...(form.specs.foam.trim() ? { foam: form.specs.foam.trim() } : {}),
        dimensions: form.specs.dimensions.trim(),
        weight: form.specs.weight.trim(),
        warranty: form.specs.warranty.trim(),
      },
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      resetForm();
      setShowForm(false);
      await fetchProducts();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
      await fetchProducts();
    } catch {
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="px-2 pb-16">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-theme-ink dark:text-theme-ivory">Products</h1>
          <p className="mt-0.5 text-xs text-theme-walnut/60 dark:text-theme-ivory/50">
            {products.length} product{products.length !== 1 ? 's' : ''} in catalogue
          </p>
        </div>
        <button
          onClick={showForm ? () => { setShowForm(false); resetForm(); } : openCreate}
          className="flex items-center gap-2 rounded-full bg-theme-bronze px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-theme-ink dark:hover:bg-white dark:hover:text-theme-ink"
        >
          {showForm ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Product'}
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="mb-10 rounded-2xl border border-theme-line/50 bg-white/80 p-6 shadow-lg dark:bg-white/5">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-theme-bronze">
            {editingId ? 'Edit Product' : 'New Product'}
          </h2>

          {apiError && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {apiError}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className={labelClass()}>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Milano Sculpted Sofa" className={inputClass(!!errors.name)} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className={labelClass()}>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass(!!errors.category)}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>

            {/* Eyebrow */}
            <div>
              <label className={labelClass()}>Eyebrow Label *</label>
              <input name="eyebrow" value={form.eyebrow} onChange={handleChange} placeholder="Signature Sofa" className={inputClass(!!errors.eyebrow)} />
              {errors.eyebrow && <p className="mt-1 text-xs text-red-500">{errors.eyebrow}</p>}
            </div>

            {/* Price */}
            <div>
              <label className={labelClass()}>Price (₹) *</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="45000" className={inputClass(!!errors.price)} />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>

            {/* Image URL */}
            <div>
              <label className={labelClass()}>Main Image URL *</label>
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="/products/sofa/main.png" className={inputClass(!!errors.imageUrl)} />
              {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>}
            </div>

            {/* Description */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass()}>Description *</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="A short product description…" className={`resize-none ${inputClass(!!errors.description)}`} />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Images */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass()}>Gallery Images <span className="normal-case tracking-normal font-normal text-theme-walnut/40">(comma-separated URLs)</span></label>
              <textarea name="images" rows={2} value={form.images} onChange={handleChange} placeholder="/products/sofa/main.png, /products/sofa/top.png, /products/sofa/left.png" className={`resize-none ${inputClass()}`} />
            </div>

            {/* Model Path */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass()}>3D Model Path <span className="normal-case tracking-normal font-normal text-theme-walnut/40">(optional)</span></label>
              <input name="modelPath" value={form.modelPath} onChange={handleChange} placeholder="/3D%20models/teal%20sofa%203d%20model.glb" className={inputClass()} />
            </div>
          </div>

          {/* Specs */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">Specifications</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass()}>Material *</label>
                <input name="specs.material" value={form.specs.material} onChange={handleChange} placeholder="Premium velvet upholstery" className={inputClass(!!errors.specs)} />
              </div>
              <div>
                <label className={labelClass()}>Foam / Fill</label>
                <input name="specs.foam" value={form.specs.foam} onChange={handleChange} placeholder="High-density foam core" className={inputClass()} />
              </div>
              <div>
                <label className={labelClass()}>Dimensions *</label>
                <input name="specs.dimensions" value={form.specs.dimensions} onChange={handleChange} placeholder="300 × 90 × 80 cm" className={inputClass(!!errors.specs)} />
              </div>
              <div>
                <label className={labelClass()}>Weight *</label>
                <input name="specs.weight" value={form.specs.weight} onChange={handleChange} placeholder="80 kg" className={inputClass(!!errors.specs)} />
              </div>
              <div>
                <label className={labelClass()}>Warranty *</label>
                <input name="specs.warranty" value={form.specs.warranty} onChange={handleChange} placeholder="5 years" className={inputClass(!!errors.specs)} />
              </div>
            </div>
            {errors.specs && <p className="mt-1 text-xs text-red-500">{errors.specs}</p>}
          </div>

          {/* Colors */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-theme-walnut/70 dark:text-theme-ivory/60">Color Variants</p>
              <button type="button" onClick={addColor} className="flex items-center gap-1 text-xs font-semibold text-theme-bronze hover:underline">
                <PlusCircle className="h-3.5 w-3.5" /> Add Colour
              </button>
            </div>
            <div className="space-y-3">
              {form.colors.map((c, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <input
                      value={c.name}
                      onChange={e => updateColor(i, 'name', e.target.value)}
                      placeholder="Colour name (e.g. Olive Velvet)"
                      className={inputClass()}
                    />
                    <input
                      value={c.image}
                      onChange={e => updateColor(i, 'image', e.target.value)}
                      placeholder="Image URL"
                      className={inputClass()}
                    />
                  </div>
                  {form.colors.length > 1 && (
                    <button type="button" onClick={() => removeColor(i)} className="mt-2 text-red-400 hover:text-red-600 transition-colors" aria-label="Remove colour">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-theme-ink px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-theme-bronze disabled:opacity-50 dark:bg-white dark:text-theme-ink"
            >
              {saving ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="rounded-full border border-theme-line/60 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-theme-walnut/70 transition hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="py-12 text-center text-sm font-semibold uppercase tracking-widest text-theme-walnut/50 dark:text-theme-ivory/40">
          Loading…
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-theme-line/40 bg-white/60 py-16 text-center dark:bg-white/5">
          <p className="text-sm text-theme-walnut/50 dark:text-theme-ivory/40">No products yet.</p>
          <button onClick={openCreate} className="mt-4 text-sm font-semibold text-theme-bronze hover:underline">
            Add your first product →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product._id} className="rounded-2xl border border-theme-line/40 bg-white/80 shadow-sm dark:bg-white/5 overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 p-5">
                {/* Thumbnail */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-14 w-14 rounded-xl object-cover shrink-0 border border-theme-line/30"
                />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-theme-ink dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-theme-walnut/60 dark:text-theme-ivory/50 mt-0.5">
                    <span className="capitalize">{product.category}</span>
                    {' · '}
                    <span className="text-theme-bronze font-semibold">₹{product.price.toLocaleString('en-IN')}</span>
                  </p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === product._id ? null : product._id)}
                    className="flex items-center gap-1 rounded-lg border border-theme-line/50 px-3 py-1.5 text-xs font-semibold text-theme-walnut/70 transition hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/60"
                    aria-label="Toggle details"
                  >
                    {expandedId === product._id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    Details
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="flex items-center gap-1 rounded-lg border border-theme-line/50 px-3 py-1.5 text-xs font-semibold text-theme-walnut/70 transition hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/60"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    className="flex items-center gap-1 rounded-lg border border-red-200/60 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:border-red-400 hover:text-red-600 dark:border-red-800/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === product._id && (
                <div className="border-t border-theme-line/40 bg-theme-ivory/50 px-5 py-4 dark:bg-white/5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                    <div>
                      <p className="font-bold uppercase tracking-widest text-theme-bronze mb-1">Description</p>
                      <p className="text-theme-walnut/80 dark:text-theme-ivory/70 leading-relaxed">{product.description}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-widest text-theme-bronze mb-1">Specs</p>
                      <div className="space-y-0.5 text-theme-walnut/70 dark:text-theme-ivory/60">
                        <p>Material: {product.specs.material}</p>
                        {product.specs.foam && <p>Fill: {product.specs.foam}</p>}
                        <p>Dimensions: {product.specs.dimensions}</p>
                        <p>Weight: {product.specs.weight}</p>
                        <p>Warranty: {product.specs.warranty}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-widest text-theme-bronze mb-1">Colours ({product.colors.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.colors.map((c, i) => (
                          <span key={i} className="rounded-full border border-theme-line/50 px-2 py-0.5 text-theme-walnut/70 dark:text-theme-ivory/60">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
