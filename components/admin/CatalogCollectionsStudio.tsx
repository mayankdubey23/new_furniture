'use client';

import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Pencil,
  PlusCircle,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type { CatalogEntityRecord, CatalogOptionsResponse } from '@/lib/catalogEntities';
import { getApiUrl } from '@/lib/api/browser';
import { emitAdminToast } from '@/lib/adminNotifications';
import { announceStorefrontUpdate } from '@/lib/storefrontSync';

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

function countLabel(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

const catalogFallbackImages: Partial<Record<CollectionKey, Record<string, string>>> = {
  maincategory: {
    sofa: '/products/sofa/main.png',
    recliner: '/products/recliners/main.png',
    pouffe: '/products/pouffes/main.png',
    chair: '/products/chairs/main.png',
  },
  brand: {
    'furniture-lele': '/products/sofa/cover.png',
  },
};

function normalizeCatalogLookupKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveCatalogFallbackImage(
  collection: CollectionKey,
  item: Pick<CatalogEntityRecord, 'name' | 'slug' | 'pic'> | string
) {
  const fallbackMap = catalogFallbackImages[collection];
  const key =
    typeof item === 'string'
      ? normalizeCatalogLookupKey(item)
      : normalizeCatalogLookupKey(item.slug || item.name);

  return fallbackMap?.[key] || '';
}

function formatDate(value?: string) {
  if (!value) {
    return 'Recently updated';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return 'Recently updated';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CollectionPanel({
  title,
  itemLabel,
  description,
  collection,
  route,
  items,
  linkedCounts,
  onRefresh,
}: {
  title: string;
  itemLabel: string;
  description: string;
  collection: CollectionKey;
  route: RoutePath;
  items: CatalogEntityRecord[];
  linkedCounts?: Record<string, number>;
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<EntityForm>({ name: '', pic: '', active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearLocalAsset = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview('');
    setSelectedFile(null);
  };

  const resetForm = () => {
    setForm({ name: '', pic: '', active: true });
    setEditingId(null);
    clearLocalAsset();
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (item: CatalogEntityRecord) => {
    resetForm();
    setForm({
      name: item.name,
      pic: item.pic || resolveCatalogFallbackImage(collection, item),
      active: item.active,
    });
    setEditingId(item._id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const previewSource =
    localPreview || form.pic || resolveCatalogFallbackImage(collection, form.name);

  const handleSelectFile = (file: File) => {
    clearLocalAsset();
    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setLocalPreview(preview);
    setSuccess('Uploading image...');
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', 'catalog');
    formData.append('collection', collection);
    formData.append('entityName', form.name.trim() || title);

    void fetch(getApiUrl('/api/admin/uploads'), {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || 'Upload failed');
        }

        setForm((current) => ({ ...current, pic: String(data?.path || '') }));
        setSuccess('Image uploaded. Save this record to publish it.');
      })
      .catch((uploadError) => {
        setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
        setSuccess('');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const buildRequestBody = () => {
    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('active', String(form.active));

    const imagePath = form.pic.trim() || resolveCatalogFallbackImage(collection, form.name);

    if (imagePath) {
      body.append('pic', imagePath);
    }

    return body;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.name.trim()) {
        throw new Error(`${title} name is required.`);
      }

      const wasEditing = Boolean(editingId);
      const response = await fetch(
        getApiUrl(editingId ? `/api/${route}/${editingId}` : `/api/${route}`),
        {
          method: editingId ? 'PUT' : 'POST',
          credentials: 'include',
          body: buildRequestBody(),
        }
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Save failed');
      }

      resetForm();
      setShowForm(false);
      setSuccess(wasEditing ? `${title} updated.` : `${title} created.`);
      await onRefresh();
      announceStorefrontUpdate(`catalog-${collection}-save`);
      emitAdminToast({
        type: 'success',
        message: wasEditing
          ? `${title} updated successfully. Storefront is updating now.`
          : `${title} created successfully. Storefront is updating now.`,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()}?`)) {
      return;
    }

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
    announceStorefrontUpdate(`catalog-${collection}-delete`);
    emitAdminToast({
      type: 'success',
      message: `${title} deleted successfully. Storefront is updating now.`,
    });
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-[1.9rem] border border-theme-line/50 bg-white/78 p-4 shadow-[0_20px_50px_rgba(49,30,21,0.06)] dark:bg-white/5 sm:p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">
              {title}
            </p>
            <span className="rounded-full border border-theme-line/60 bg-theme-ivory/70 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-theme-walnut/68 dark:bg-white/6 dark:text-theme-ivory/64">
              {countLabel(items.length, itemLabel)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-theme-walnut/66 dark:text-theme-ivory/60">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              openCreate();
            }
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 sm:w-auto"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : `Add ${itemLabel}`}
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
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-[1.6rem] border border-theme-line/50 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(244,234,222,0.76))] p-4 shadow-[0_16px_34px_rgba(49,30,21,0.05)] dark:bg-white/4 sm:p-5"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start xl:gap-5">
            <div className="min-w-0 rounded-[1.4rem] border border-theme-line/50 bg-theme-ivory/55 p-4 dark:bg-white/4">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                Image Preview
              </p>
              <div className="mt-4 flex aspect-[16/11] items-center justify-center overflow-hidden rounded-[1.1rem] border border-theme-line/50 bg-white/80 dark:bg-white/8 sm:aspect-[4/3]">
                {previewSource ? (
                  <img src={previewSource} alt={form.name || title} className="h-full w-full object-cover" />
                ) : (
                  <div className="px-6 text-center text-sm text-theme-walnut/55 dark:text-theme-ivory/50">
                    Choose an image or paste an existing upload path.
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/5 sm:w-auto">
                  {saving || uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  {uploading ? 'Uploading' : 'Choose Image'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    disabled={saving || uploading}
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) {
                        void handleSelectFile(file);
                      }
                      event.currentTarget.value = '';
                    }}
                  />
                </label>

                {selectedFile || previewSource ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearLocalAsset();
                      setForm((current) => ({ ...current, pic: '' }));
                      setSuccess('');
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-theme-walnut/66 transition hover:border-red-300/70 hover:text-red-600 dark:text-theme-ivory/62 sm:w-auto"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear Image
                  </button>
                ) : null}
              </div>

              {selectedFile ? (
                <p className="mt-3 text-xs text-theme-walnut/58 dark:text-theme-ivory/54">
                  Selected: {selectedFile.name}
                </p>
              ) : null}
            </div>

            <div className="min-w-0 grid gap-4">
              <div>
                <label className={labelClass()}>Name</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className={inputClass(!form.name.trim())}
                  placeholder={`Enter ${title.toLowerCase()} name`}
                />
              </div>

              <div>
                <label className={labelClass()}>Image Path</label>
                <input
                  value={form.pic}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, pic: event.target.value }))
                  }
                  className={inputClass()}
                  placeholder={`/uploads/${collection}/your-image.jpg`}
                />
              </div>

              <div className="flex flex-col gap-4 rounded-[1.2rem] border border-theme-line/50 bg-theme-ivory/55 px-4 py-3 dark:bg-white/4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-bronze">
                    Visibility
                  </p>
                  <p className="mt-1 text-sm text-theme-walnut/64 dark:text-theme-ivory/58">
                    Hide this {itemLabel.toLowerCase()} without deleting its record.
                  </p>
                </div>
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

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-theme-bronze disabled:opacity-60 sm:w-auto"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? 'Saving' : editingId ? `Update ${itemLabel}` : `Create ${itemLabel}`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full rounded-full border border-theme-line/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/68 transition hover:border-theme-bronze hover:text-theme-bronze dark:text-theme-ivory/64 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const itemImage = item.pic || resolveCatalogFallbackImage(collection, item);
          const linkedCount = linkedCounts?.[item._id] || 0;
          const isDeleteBlocked = linkedCount > 0;

          return (
            <div
              key={item._id}
              className="flex flex-col gap-4 rounded-[1.35rem] border border-theme-line/50 bg-theme-ivory/45 px-4 py-4 dark:bg-white/4 sm:flex-row sm:items-start"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.1rem] border border-theme-line/50 bg-white/80 dark:bg-white/10">
                {itemImage ? (
                  <img src={itemImage} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[0.62rem] uppercase tracking-[0.18em] text-theme-walnut/45 dark:text-theme-ivory/40">
                    No Image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">
                    {item.name}
                  </p>
                  <span
                    className={`rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] ${
                      item.active
                        ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
                        : 'border-theme-line/60 bg-white/70 text-theme-walnut/58 dark:bg-white/8 dark:text-theme-ivory/58'
                    }`}
                  >
                    {item.active ? 'Active' : 'Hidden'}
                  </span>
                  {linkedCount ? (
                    <span className="rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-700">
                      Used In {linkedCount} {linkedCount === 1 ? 'Product' : 'Products'}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-6 text-theme-walnut/56 dark:text-theme-ivory/52">
                  Updated {formatDate(item.updatedAt || item.createdAt)}
                </p>
                {isDeleteBlocked ? (
                  <p className="mt-1 text-xs leading-6 text-amber-700 dark:text-amber-300">
                    Reassign those products before deleting this {itemLabel.toLowerCase()}.
                  </p>
                ) : null}
                {itemImage ? (
                  <p className="mt-1 truncate text-[0.68rem] text-theme-walnut/50 dark:text-theme-ivory/46">
                    {itemImage}
                  </p>
                ) : null}
              </div>

              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-theme-line/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:border-theme-bronze hover:text-theme-bronze sm:flex-none"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isDeleteBlocked}
                  title={
                    isDeleteBlocked
                      ? `Reassign ${linkedCount} linked ${linkedCount === 1 ? 'product' : 'products'} first.`
                      : `Delete this ${itemLabel.toLowerCase()}.`
                  }
                  onClick={() => void handleDelete(item._id)}
                  className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition sm:flex-none ${
                    isDeleteBlocked
                      ? 'cursor-not-allowed border-theme-line/60 text-theme-walnut/42 opacity-60 dark:text-theme-ivory/38'
                      : 'border-red-300/70 text-red-600 hover:bg-red-50/70'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeleteBlocked ? 'In Use' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}

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
  linkedEntityCounts,
  onRefresh,
}: {
  catalogOptions: CatalogOptionsResponse;
  linkedEntityCounts?: Partial<Record<CollectionKey, Record<string, number>>>;
  onRefresh: () => Promise<void>;
}) {
  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-4 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] sm:p-5 md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">
            Catalog Collections
          </p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">
            Main Categories and Brands
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
            The catalog is the admin setup area for product grouping and brand labels. Products
            use these records so you can add future categories like Bed later without rebuilding
            the product editor.
          </p>
        </div>

        <div className="w-full rounded-[1.5rem] border border-theme-line/50 bg-white/74 px-4 py-3 text-sm text-theme-walnut/66 shadow-[0_12px_28px_rgba(49,30,21,0.04)] dark:bg-white/6 dark:text-theme-ivory/60 sm:w-auto">
          {countLabel(catalogOptions.mainCategories.length, 'main category')} |{' '}
          {countLabel(catalogOptions.brands.length, 'brand')}
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          'Create main categories here first, then assign them while adding products.',
          'Brands stay reusable across every product you add later.',
          'Upload an image for each record, or let the built-in default image show for the current core categories.',
        ].map((note) => (
          <div
            key={note}
            className="rounded-[1.3rem] border border-theme-line/50 bg-white/70 px-4 py-3 text-sm leading-6 text-theme-walnut/66 dark:bg-white/5 dark:text-theme-ivory/60"
          >
            {note}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CollectionPanel
          title="Main Category"
          itemLabel="Category"
          description="Top-level product groups like Sofa, Chair, or future additions like Bed."
          collection="maincategory"
          route="maincategories"
          items={catalogOptions.mainCategories}
          linkedCounts={linkedEntityCounts?.maincategory}
          onRefresh={onRefresh}
        />
        <CollectionPanel
          title="Brand"
          itemLabel="Brand"
          description="Brand labels reused across product entries, even as the catalog grows later."
          collection="brand"
          route="brands"
          items={catalogOptions.brands}
          linkedCounts={linkedEntityCounts?.brand}
          onRefresh={onRefresh}
        />
      </div>
    </section>
  );
}
