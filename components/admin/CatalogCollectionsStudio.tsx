'use client';

import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  PlusCircle,
  Save,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import type { CatalogEntityRecord, CatalogOptionsResponse } from '@/lib/catalogEntities';
import { getApiUrl } from '@/lib/api/browser';

type CollectionKey = 'maincategory' | 'subcategory' | 'brand';
type RoutePath = 'maincategories' | 'subcategories' | 'brands';

type EntityForm = {
  name: string;
  pic: string;
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

function UploadButton({
  busy,
  onSelect,
}: {
  busy: boolean;
  onSelect: (file: File) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/6 dark:text-theme-ivory/68">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
      {busy ? 'Uploading' : 'Upload'}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
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

function CollectionPanel({
  title,
  description,
  collection,
  route,
  items,
  onRefresh,
}: {
  title: string;
  description: string;
  collection: CollectionKey;
  route: RoutePath;
  items: CatalogEntityRecord[];
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<EntityForm>({ name: '', pic: '', active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm({ name: '', pic: '', active: true });
    setEditingId(null);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('scope', 'catalog');
      fd.append('collection', collection);
      fd.append('entityName', form.name || title);
      const response = await fetch(getApiUrl('/api/admin/uploads'), {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Upload failed');
      setForm((current) => ({ ...current, pic: String(data?.path || '') }));
      setSuccess('Image uploaded.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const wasEditing = Boolean(editingId);
      const response = await fetch(getApiUrl(editingId ? `/api/${route}/${editingId}` : `/api/${route}`), {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Save failed');
      resetForm();
      setShowForm(false);
      setSuccess(wasEditing ? `${title} updated.` : `${title} created.`);
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()}?`)) return;
    setError('');
    setSuccess('');
    const response = await fetch(getApiUrl(`/api/${route}/${id}`), {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error || 'Delete failed');
      return;
    }
    setSuccess(`${title} deleted.`);
    await onRefresh();
  };

  return (
    <div className="rounded-[1.8rem] border border-theme-line/50 bg-white/76 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">{title}</p>
          <p className="mt-2 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">{description}</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            setShowForm((current) => !current);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-[1rem] border border-red-300/30 bg-red-50/70 px-3 py-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-4 flex items-center gap-2 rounded-[1rem] border border-emerald-300/30 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="mb-5 rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/45 p-4 dark:bg-white/4">
          <div className="grid gap-4">
            <div>
              <label className={labelClass()}>Name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass(!form.name)} />
            </div>
            <div>
              <label className={labelClass()}>Image Path</label>
              <input value={form.pic} onChange={(event) => setForm((current) => ({ ...current, pic: event.target.value }))} className={inputClass()} placeholder="/uploads/maincategory/..." />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <UploadButton busy={uploading} onSelect={uploadImage} />
              <div className="flex items-center justify-between gap-4 rounded-full border border-theme-line/60 bg-white/70 px-4 py-3 dark:bg-white/5">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-walnut/70 dark:text-theme-ivory/66">Active</span>
                <button type="button" onClick={() => setForm((current) => ({ ...current, active: !current.active }))} className={`relative h-8 w-14 rounded-full transition ${form.active ? 'bg-theme-bronze' : 'bg-theme-sand'}`}>
                  <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${form.active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? 'Saving' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-full border border-theme-line/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/68">
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex flex-wrap items-center gap-4 rounded-[1.3rem] border border-theme-line/50 bg-theme-ivory/45 px-4 py-4 dark:bg-white/4">
            <div className="h-14 w-14 overflow-hidden rounded-[0.9rem] border border-theme-line/50 bg-white/70">

              {item.pic ? <img src={item.pic} alt={item.name} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">{item.name}</p>
              <p className="mt-1 text-xs text-theme-walnut/60 dark:text-theme-ivory/56">{item.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setForm({ name: item.name, pic: item.pic || '', active: item.active });
                  setEditingId(item._id);
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
                onClick={() => handleDelete(item._id)}
                className="inline-flex items-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="rounded-[1.2rem] border border-dashed border-theme-line/60 px-4 py-6 text-center text-sm text-theme-walnut/55 dark:text-theme-ivory/50">
            No entries created yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CatalogCollectionsStudio({
  catalogOptions,
  onRefresh,
}: {
  catalogOptions: CatalogOptionsResponse;
  onRefresh: () => Promise<void>;
}) {
  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
      <div className="mb-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Catalog Collections</p>
        <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">Main Categories, Subcategories, and Brands</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
          These collections power the linked dropdowns used by product records.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <CollectionPanel title="Main Category" description="Top-level product groups like Sofa or Chair." collection="maincategory" route="maincategories" items={catalogOptions.mainCategories} onRefresh={onRefresh} />
        <CollectionPanel title="Subcategory" description="Secondary groupings like Wood or Lounge." collection="subcategory" route="subcategories" items={catalogOptions.subCategories} onRefresh={onRefresh} />
        <CollectionPanel title="Brand" description="Brand records referenced by product entries." collection="brand" route="brands" items={catalogOptions.brands} onRefresh={onRefresh} />
      </div>
    </section>
  );
}
