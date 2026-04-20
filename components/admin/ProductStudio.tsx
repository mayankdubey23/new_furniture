'use client';

import { Fragment, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
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
import type { CatalogEntityRecord, CatalogOptionsResponse } from '@/lib/catalogEntities';
import {
  PRODUCT_VIEW_KEYS,
  extractAdditionalGalleryImages,
  prepareProductMutationInput,
  type ProductColorEntry,
  type ProductSpecItem,
  type ProductSpecSection,
  type ProductViewKey,
} from '@/lib/productCatalog';
import type { AdminProduct } from '@/lib/adminDashboard';
import { downloadCsv, formatCurrency } from '@/lib/adminDashboard';
import { getApiUrl } from '@/lib/api/browser';
import { emitAdminToast } from '@/lib/adminNotifications';
import { announceStorefrontUpdate } from '@/lib/storefrontSync';

type ProductForm = {
  name: string;
  description: string;
  mainCategoryId: string;
  subCategoryId: string;
  brandId: string;
  mainCategoryName: string;
  subCategoryName: string;
  brandName: string;
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
    sections: ProductSpecSection[];
  };
};

const VIEW_KEYS: ProductViewKey[] = [...PRODUCT_VIEW_KEYS];
const GLB_FILE_PATTERN = /\.glb(?:[?#].*)?$/i;

const VIEW_LABELS: Record<ProductViewKey, string> = {
  main: 'Main Image',
  cover: 'Cover View',
  left: 'Left View',
  right: 'Right View',
  top: 'Top View',
  detail: 'Detail / Close-up',
};

function emptySpecItem(): ProductSpecItem {
  return { label: '', value: '' };
}

function emptySpecSection(): ProductSpecSection {
  return {
    title: '',
    items: [emptySpecItem()],
  };
}

function buildLegacySpecSections(specs: Partial<ProductForm['specs']>) {
  const sections: ProductSpecSection[] = [];

  if (String(specs.dimensions || '').trim()) {
    sections.push({
      title: 'Dimensions',
      items: [{ label: 'Dimensions', value: String(specs.dimensions || '').trim() }],
    });
  }

  const materialItems = [
    String(specs.material || '').trim()
      ? { label: 'Material', value: String(specs.material || '').trim() }
      : null,
    String(specs.foam || '').trim()
      ? { label: 'Foam & Fill', value: String(specs.foam || '').trim() }
      : null,
  ].filter((item): item is ProductSpecItem => Boolean(item));

  if (materialItems.length) {
    sections.push({
      title: 'Material',
      items: materialItems,
    });
  }

  const additionalItems = [
    String(specs.weight || '').trim()
      ? { label: 'Weight', value: String(specs.weight || '').trim() }
      : null,
    String(specs.warranty || '').trim()
      ? { label: 'Warranty', value: String(specs.warranty || '').trim() }
      : null,
  ].filter((item): item is ProductSpecItem => Boolean(item));

  if (additionalItems.length) {
    sections.push({
      title: 'Additional Details',
      items: additionalItems,
    });
  }

  return sections;
}

function cloneSpecSections(
  sections: ProductSpecSection[] | undefined,
  fallbackSpecs?: Partial<ProductForm['specs']>
) {
  const normalizedSections =
    Array.isArray(sections) && sections.length
      ? sections
          .map((section) => ({
            title: String(section?.title || '').trim(),
            items:
              Array.isArray(section?.items) && section.items.length
                ? section.items.map((item) => ({
                    label: String(item?.label || '').trim(),
                    value: String(item?.value || '').trim(),
                  }))
                : [emptySpecItem()],
          }))
          .filter(
            (section) =>
              section.title || section.items.some((item) => item.label || item.value)
          )
      : buildLegacySpecSections(fallbackSpecs || {});

  return normalizedSections.length ? normalizedSections : [emptySpecSection()];
}

function sanitizeStringArray(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function sanitizeColors(colors: ProductColorEntry[], fallbackImage = '') {
  return colors
    .map((color) => ({
      name: String(color.name || '').trim(),
      image: String(color.image || '').trim() || fallbackImage,
    }))
    .filter((color) => color.name && color.image);
}

function sanitizeSpecSections(sections: ProductSpecSection[]) {
  return sections
    .map((section) => ({
      title: String(section.title || '').trim(),
      items: Array.isArray(section.items)
        ? section.items
            .map((item) => ({
              label: String(item.label || '').trim(),
              value: String(item.value || '').trim(),
            }))
            .filter((item) => item.label && item.value)
        : [],
    }))
    .filter((section) => section.title && section.items.length);
}

function emptyForm(): ProductForm {
  return {
    name: '',
    description: '',
    mainCategoryId: '',
    subCategoryId: '',
    brandId: '',
    mainCategoryName: '',
    subCategoryName: '',
    brandName: '',
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
    gallery: [''],
    colors: [{ name: '', image: '' }],
    specs: {
      material: '',
      foam: '',
      dimensions: '',
      weight: '',
      warranty: '',
      sections: [emptySpecSection()],
    },
  };
}

function inputClass(error?: boolean) {
  return `w-full rounded-2xl border px-4 py-3 text-sm font-medium text-black placeholder:text-stone-500 outline-none transition dark:bg-white/5 dark:text-theme-ivory dark:placeholder:text-theme-ivory/48 ${
    error
      ? 'border-red-400 bg-red-50/90 focus:border-red-400'
      : 'border-black/12 bg-white/95 shadow-[0_8px_20px_rgba(34,27,23,0.04)] focus:border-black/55'
  }`;
}

function labelClass() {
  return 'mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/75 dark:text-theme-ivory/72';
}

function outlineButtonClass() {
  return 'inline-flex items-center gap-2 rounded-full border border-black/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_10px_24px_rgba(34,27,23,0.08)] transition hover:border-[color:var(--theme-contrast-ink)] hover:bg-[color:var(--theme-contrast-ink)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-black/70 disabled:hover:bg-white disabled:hover:text-black dark:border-theme-ivory/28 dark:bg-white/8 dark:text-theme-ivory dark:hover:border-theme-ivory dark:hover:bg-theme-ivory dark:hover:text-[var(--theme-contrast-ink)]';
}

function subtleButtonClass() {
  return outlineButtonClass();
}

function AssetPreview({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  if (!src) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-theme-line/60 text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-theme-walnut/45 dark:text-theme-ivory/45">
        Empty
      </div>
    );
  }

  return (
    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-theme-line/50 bg-white/70">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
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
    <label className={`${outlineButtonClass()} cursor-pointer`}>
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
  const [showMainCategoryCreator, setShowMainCategoryCreator] = useState(false);
  const [creatingMainCategory, setCreatingMainCategory] = useState(false);
  const [newMainCategoryName, setNewMainCategoryName] = useState('');
  const [newMainCategoryImage, setNewMainCategoryImage] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

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
          product.brandName,
          product.category,
        ]
          .join(' ')
          .toLowerCase();
        return matchesFilter && (!query || text.includes(query));
      });
  }, [products, search, mainCategoryFilter]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setApiError('');
    setSuccessMessage('');
    setShowMainCategoryCreator(false);
    setCreatingMainCategory(false);
    setNewMainCategoryName('');
    setNewMainCategoryImage('');
  };

  const closeEditor = () => {
    setShowForm(false);
    resetForm();
  };

  const scrollToEditor = (editorId: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(editorId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const openCreate = () => {
    resetForm();
    if (catalogOptions.mainCategories.length === 1) {
      const onlyMainCategory = catalogOptions.mainCategories[0];
      setForm((current) => ({
        ...current,
        mainCategoryId: onlyMainCategory._id,
        mainCategoryName: onlyMainCategory.name,
      }));
    }
    if (catalogOptions.brands.length === 1) {
      const onlyBrand = catalogOptions.brands[0];
      setForm((current) => ({
        ...current,
        brandId: onlyBrand._id,
        brandName: onlyBrand.name,
      }));
    }
    setShowForm(true);
    scrollToEditor('product-editor-create');
  };

  const setView = (key: ProductViewKey, value: string) =>
    setForm((current) => ({ ...current, views: { ...current.views, [key]: value } }));

  const setSpecField = (
    field: keyof ProductForm['specs'],
    value: string | ProductSpecSection[]
  ) =>
    setForm((current) => ({
      ...current,
      specs: { ...current.specs, [field]: value },
    }));

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
    if (showForm && editingId === product._id) {
      closeEditor();
      return;
    }

    const fallbackSpecs = {
      material: product.specs?.material || '',
      foam: product.specs?.foam || '',
      dimensions: product.specs?.dimensions || '',
      weight: product.specs?.weight || '',
      warranty: product.specs?.warranty || '',
    };

    setForm({
      name: product.name,
      description: product.description,
      mainCategoryId: product.mainCategoryId || product.mainCategory?._id || '',
      subCategoryId: '',
      brandId: product.brandId || product.brand?._id || '',
      mainCategoryName: product.mainCategoryName || product.mainCategory?.name || '',
      subCategoryName: '',
      brandName: product.brandName || product.brand?.name || '',
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
      gallery: extractAdditionalGalleryImages(product).length
        ? extractAdditionalGalleryImages(product)
        : [''],
      colors: product.colors?.length
        ? product.colors.map((color) => ({ ...color }))
        : [{ name: '', image: '' }],
      specs: {
        ...fallbackSpecs,
        sections: cloneSpecSections(product.specs?.sections, fallbackSpecs),
      },
    });
    setEditingId(product._id);
    setShowForm(true);
    setApiError('');
    setSuccessMessage('');
    scrollToEditor(`product-editor-${product._id}`);
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
      const message = data?.error || 'Delete failed';
      setApiError(message);
      emitAdminToast({ type: 'error', message });
      return;
    }
    setSuccessMessage('Product deleted.');
    await onRefresh();
    announceStorefrontUpdate('product-delete');
    emitAdminToast({ type: 'success', message: 'Product deleted successfully.' });
  };

  const applySelectedMainCategory = (entry: Pick<CatalogEntityRecord, '_id' | 'name'>) => {
    setForm((current) => ({
      ...current,
      mainCategoryId: entry._id,
      mainCategoryName: entry.name,
    }));
  };

  const handleCreateMainCategory = async () => {
    const name = newMainCategoryName.trim();
    const pic = newMainCategoryImage.trim();

    if (!name) {
      setApiError('Enter a main category name first.');
      return;
    }

    setCreatingMainCategory(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const body = new FormData();
      body.append('name', name);
      body.append('active', 'true');

      if (pic) {
        body.append('pic', pic);
      }

      const response = await fetch(getApiUrl('/api/maincategories'), {
        method: 'POST',
        credentials: 'include',
        body,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create main category.');
      }

      const createdId = String(data?._id || data?.id || '');
      const createdName = String(data?.name || name);

      await onRefresh();
      applySelectedMainCategory({ _id: createdId, name: createdName });
      setShowMainCategoryCreator(false);
      setNewMainCategoryName('');
      setNewMainCategoryImage('');
      setSuccessMessage(`Main category "${createdName}" created and selected.`);
      emitAdminToast({
        type: 'success',
        message: `Main category "${createdName}" is ready to use for this product.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create main category.';
      setApiError(message);
      emitAdminToast({ type: 'error', message });
    } finally {
      setCreatingMainCategory(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setApiError('');
    setSuccessMessage('');
    try {
      const mainImage = form.views.main.trim();
      const selectedMainCategoryName =
        optionName(catalogOptions.mainCategories, form.mainCategoryId) || form.mainCategoryName.trim();
      const selectedBrandName =
        optionName(catalogOptions.brands, form.brandId) || form.brandName.trim();

      if (!selectedMainCategoryName || !selectedBrandName) {
        throw new Error('Please keep or select a main category and brand.');
      }

      if (!form.name.trim()) {
        throw new Error('Product name is required.');
      }

      if (!form.description.trim()) {
        throw new Error('Product description is required.');
      }

      if (!mainImage) {
        throw new Error('Add the main product image for Details & Purchase.');
      }

      const galleryImages = sanitizeStringArray(form.gallery);
      const resolvedGalleryImages = galleryImages.length ? galleryImages : [mainImage];
      if (!resolvedGalleryImages.length) {
        throw new Error('Add at least one gallery image or keep the main image filled.');
      }

      const colors = sanitizeColors(form.colors, mainImage);
      if (!colors.length) {
        throw new Error('Add at least one color variant name. Its image can reuse the main product image.');
      }

      const modelPath = form.modelPath.trim();
      if (!modelPath) {
        throw new Error('Upload a .glb 3D model for this product.');
      }

      if (!GLB_FILE_PATTERN.test(modelPath)) {
        throw new Error('The 3D model must be a .glb file.');
      }

      const detailedSections = sanitizeSpecSections(form.specs.sections);
      if (!detailedSections.length) {
        throw new Error('Add at least one View More Specs section with one detail row.');
      }

      const resolvedBasePrice = form.basePrice.trim() || form.finalPrice.trim();
      const resolvedFinalPrice = form.finalPrice.trim() || form.basePrice.trim();

      if (!resolvedBasePrice) {
        throw new Error('Add the base price or final price.');
      }

      if (!resolvedFinalPrice) {
        throw new Error('Add the final price or base price.');
      }

      const payload = prepareProductMutationInput({
        name: form.name,
        description: form.description,
        mainCategory: form.mainCategoryId,
        subCategory: '',
        brand: form.brandId,
        mainCategoryName: selectedMainCategoryName,
        subCategoryName: '',
        brandName: selectedBrandName,
        eyebrow: form.eyebrow,
        basePrice: resolvedBasePrice,
        discount: form.discount,
        finalPrice: resolvedFinalPrice,
        stockQuantity: form.stockQuantity,
        inStock: form.inStock,
        active: form.active,
        size: form.sizeInput.split(',').map((entry) => entry.trim()).filter(Boolean),
        modelPath,
        media: {
          views: Object.fromEntries(
            VIEW_KEYS.map((key) => [key, form.views[key].trim()])
          ) as Record<ProductViewKey, string>,
          gallery: resolvedGalleryImages,
        },
        colors,
        specs: {
          material: form.specs.material,
          foam: form.specs.foam,
          dimensions: form.specs.dimensions,
          weight: form.specs.weight,
          warranty: form.specs.warranty,
          sections: detailedSections,
        },
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
      const savedProductId = String(data?._id || data?.id || editingId || '');

      resetForm();
      setShowForm(false);
      setSuccessMessage(wasEditing ? 'Product updated.' : 'Product created.');
      await onRefresh();
      if (savedProductId && typeof window !== 'undefined') {
        window.setTimeout(() => {
          document.getElementById(`product-card-${savedProductId}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 120);
      }
      announceStorefrontUpdate(wasEditing ? 'product-update' : 'product-create');
      emitAdminToast({
        type: 'success',
        message: wasEditing
          ? 'Product updated successfully. Storefront is updating now.'
          : 'Product created successfully. Storefront is updating now.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      setApiError(message);
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          formRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      }
      emitAdminToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/72 dark:text-theme-ivory/72">Catalogue Studio</p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">Product Management</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-black/72 dark:text-theme-ivory/68">
            Edit Milano Sculpted Sofa, Verona Accent Chair, Aurelian Leather Recliner,
            Atelier Accent Pouffe, or add a new product with the same full structure:
            purchase details, gallery, color variants, complete specs, and a `.glb` 3D
            model.
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
                  brand: product.brandName || '',
                  price: product.finalPrice ?? product.price,
                  stock: product.stockQuantity ?? product.stock ?? 0,
                }))
              )
            }
            className={subtleButtonClass()}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            type="button"
            onClick={() => {
              if (showForm && !editingId) {
                closeEditor();
                return;
              }
              openCreate();
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-theme-bronze px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-ink sm:w-auto"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
            {showForm && !editingId ? 'Close' : 'Add Product'}
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
        <div className="flex items-center gap-3 rounded-full border border-black/12 bg-white/95 px-4 py-3 text-black shadow-[0_8px_20px_rgba(34,27,23,0.06)] dark:bg-white/5 dark:text-theme-ivory">
          <Search className="h-4 w-4 text-theme-bronze" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-stone-500 dark:placeholder:text-theme-ivory/48"
          />
        </div>
        <select
          value={mainCategoryFilter}
          onChange={(event) => setMainCategoryFilter(event.target.value)}
          className="rounded-full border border-black/12 bg-white/95 px-4 py-3 text-sm font-medium text-black shadow-[0_8px_20px_rgba(34,27,23,0.06)] outline-none dark:bg-white/5 dark:text-theme-ivory"
        >
          <option value="all">All main categories</option>
          {catalogOptions.mainCategories.map((entry) => (
            <option key={entry._id} value={entry._id}>{entry.name}</option>
          ))}
        </select>
      </div>

      {showForm ? (() => {
        const resolvedMainCategoryName =
          optionName(catalogOptions.mainCategories, form.mainCategoryId) || form.mainCategoryName.trim();
        const resolvedBrandName =
          optionName(catalogOptions.brands, form.brandId) || form.brandName.trim();
        const portalTarget =
          editingId && typeof document !== 'undefined'
            ? document.getElementById(`product-editor-slot-${editingId}`)
            : null;

        const formNode = (
        <form
          ref={formRef}
          id={editingId ? `product-editor-${editingId}` : 'product-editor-create'}
          onSubmit={handleSubmit}
          className="mb-8 rounded-[2rem] border border-theme-line/50 bg-white/74 p-5 text-[color:var(--theme-contrast-ink)] shadow-[0_20px_60px_rgba(49,30,21,0.07)] dark:bg-white/5 sm:p-6"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/72 dark:text-theme-ivory/72">
                {editingId ? 'Edit Product' : 'New Product'}
              </p>
              <h3 className="mt-2 font-display text-2xl text-theme-ink dark:text-theme-ivory">
                {editingId ? `Editing ${form.name || 'Selected Product'}` : 'Create New Product'}
              </h3>
              <p className="mt-2 text-sm leading-7 text-black/72 dark:text-theme-ivory/68">
                {editingId
                  ? 'This editor opens below the selected product so you can update it while viewing the card.'
                  : 'Fill in the full product structure: purchase details, gallery, color variants, specs, and a `.glb` 3D model.'}
              </p>
            </div>
            <button
              type="button"
              onClick={closeEditor}
              className={outlineButtonClass()}
            >
              <X className="h-3.5 w-3.5" />
              Close Editor
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass()}>Product Name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass(!form.name.trim())} placeholder="Milano Sculpted Sofa" />
            </div>
            <div>
              <label className={labelClass()}>Eyebrow / Label</label>
              <input value={form.eyebrow} onChange={(event) => setForm((current) => ({ ...current, eyebrow: event.target.value }))} className={inputClass()} placeholder="Signature Sofa" />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass()}>Main Category</label>
              <select
                value={form.mainCategoryId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mainCategoryId: event.target.value,
                    mainCategoryName:
                      optionName(catalogOptions.mainCategories, event.target.value) ||
                      current.mainCategoryName,
                  }))
                }
                className={inputClass(!resolvedMainCategoryName)}
              >
                <option value="">
                  {resolvedMainCategoryName ? `Keep current: ${resolvedMainCategoryName}` : 'Select main category'}
                </option>
                {catalogOptions.mainCategories.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
              </select>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowMainCategoryCreator((current) => !current)}
                  className={subtleButtonClass()}
                >
                  {showMainCategoryCreator ? <X className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                  {showMainCategoryCreator ? 'Close Quick Add' : 'Add Main Category'}
                </button>
                <span className="rounded-full border border-black/10 bg-stone-100 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/65 dark:bg-white/4 dark:text-theme-ivory/62">
                  {catalogOptions.mainCategories.length} available
                </span>
              </div>

              {showMainCategoryCreator ? (
                <div className="mt-3 rounded-[1.25rem] border border-theme-line/50 bg-theme-ivory/45 p-4 dark:bg-white/4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/78 dark:text-theme-ivory/76">
                    Quick Add Main Category
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/72 dark:text-theme-ivory/68">
                    Create a new category like Bed and use it for this product immediately.
                  </p>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={newMainCategoryName}
                      onChange={(event) => setNewMainCategoryName(event.target.value)}
                      className={inputClass(!newMainCategoryName.trim())}
                      placeholder="Bed"
                    />
                    <input
                      value={newMainCategoryImage}
                      onChange={(event) => setNewMainCategoryImage(event.target.value)}
                      className={inputClass()}
                      placeholder="/products/beds/main.png (optional)"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCreateMainCategory()}
                      disabled={creatingMainCategory}
                      className="inline-flex items-center gap-2 rounded-full bg-[color:var(--theme-contrast-ink)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(34,27,23,0.18)] transition hover:bg-black disabled:opacity-60"
                    >
                      {creatingMainCategory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                      {creatingMainCategory ? 'Creating' : 'Create and Select'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMainCategoryCreator(false);
                        setNewMainCategoryName('');
                        setNewMainCategoryImage('');
                      }}
                      className={outlineButtonClass()}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {catalogOptions.mainCategories.length ? (
                <div className="mt-3">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-black/70 dark:text-theme-ivory/66">
                    Available Main Categories
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {catalogOptions.mainCategories.map((entry) => {
                      const isSelected = entry._id === form.mainCategoryId;

                      return (
                        <button
                          key={entry._id}
                          type="button"
                          onClick={() => applySelectedMainCategory(entry)}
                          className={`rounded-full border px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition ${
                            isSelected
                              ? 'border-black bg-[color:var(--theme-contrast-ink)] text-white shadow-[0_10px_24px_rgba(34,27,23,0.14)] dark:border-theme-ivory dark:bg-theme-ivory dark:text-[var(--theme-contrast-ink)]'
                              : 'border-black/12 bg-white text-black shadow-[0_8px_20px_rgba(34,27,23,0.05)] hover:border-black/65 hover:bg-stone-100 dark:bg-white/4 dark:text-theme-ivory/72 dark:hover:border-theme-ivory'
                          }`}
                        >
                          {entry.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <label className={labelClass()}>Brand</label>
              <select
                value={form.brandId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    brandId: event.target.value,
                    brandName:
                      optionName(catalogOptions.brands, event.target.value) ||
                      current.brandName,
                  }))
                }
                className={inputClass(!resolvedBrandName)}
              >
                <option value="">
                  {resolvedBrandName ? `Keep current: ${resolvedBrandName}` : 'Select brand'}
                </option>
                {catalogOptions.brands.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {resolvedMainCategoryName ? (
              <div className="rounded-[1.2rem] border border-black/10 bg-stone-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/70 dark:bg-white/4 dark:text-theme-ivory/66">
                Main Category: {resolvedMainCategoryName}
              </div>
            ) : null}
            {resolvedBrandName ? (
              <div className="rounded-[1.2rem] border border-black/10 bg-stone-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/70 dark:bg-white/4 dark:text-theme-ivory/66">
                Brand: {resolvedBrandName}
              </div>
            ) : null}
          </div>

          <p className="mt-3 text-xs leading-6 text-black/65 dark:text-theme-ivory/62">
            New main categories can be added from Catalog Collections or with the quick add tool
            above, and they will show in the available category list for future products too.
          </p>

          <div className="mt-5">
            <label className={labelClass()}>Description</label>
            <textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={inputClass(!form.description.trim())} placeholder="Write the product story, comfort details, and overall buying information." />
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
            <div className="mb-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/80 dark:text-theme-ivory/76">Details & Purchase</p>
              <p className="mt-1 text-sm text-black/72 dark:text-theme-ivory/68">
                Price, stock, buying state, and the main product information shown in the purchase section.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div><label className={labelClass()}>Base Price</label><input type="number" min="0" value={form.basePrice} onChange={(event) => setForm((current) => ({ ...current, basePrice: event.target.value }))} className={inputClass()} /></div>
              <div><label className={labelClass()}>Discount (%)</label><input type="number" min="0" value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} className={inputClass()} /></div>
              <div><label className={labelClass()}>Final Price</label><input type="number" min="0" value={form.finalPrice} onChange={(event) => setForm((current) => ({ ...current, finalPrice: event.target.value }))} className={inputClass()} /></div>
              <div><label className={labelClass()}>Stock Quantity</label><input type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} className={inputClass()} /></div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-4">
              <div className="lg:col-span-2"><label className={labelClass()}>Sizes</label><input value={form.sizeInput} onChange={(event) => setForm((current) => ({ ...current, sizeInput: event.target.value }))} className={inputClass()} placeholder="3 Seater, Compact" /></div>
              <div className="flex items-center justify-between rounded-[1.4rem] border border-theme-line/50 bg-white/65 px-5 py-4 dark:bg-white/4"><span className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">Available for Purchase</span><button type="button" onClick={() => setForm((current) => ({ ...current, inStock: !current.inStock }))} className={`relative h-8 w-14 rounded-full transition ${form.inStock ? 'bg-theme-bronze' : 'bg-theme-sand'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${form.inStock ? 'left-7' : 'left-1'}`} /></button></div>
              <div className="flex items-center justify-between rounded-[1.4rem] border border-theme-line/50 bg-white/65 px-5 py-4 dark:bg-white/4"><span className="text-sm font-semibold text-theme-ink dark:text-theme-ivory">Active</span><button type="button" onClick={() => setForm((current) => ({ ...current, active: !current.active }))} className={`relative h-8 w-14 rounded-full transition ${form.active ? 'bg-theme-bronze' : 'bg-theme-sand'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${form.active ? 'left-7' : 'left-1'}`} /></button></div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/80 dark:text-theme-ivory/76">Details Images</p>
                    <p className="mt-1 text-sm text-black/72 dark:text-theme-ivory/68">These images feed the Details & Purchase area and the product gallery flow.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {VIEW_KEYS.map((key) => (
                    <div key={key} className="grid gap-3 rounded-[1.3rem] border border-theme-line/45 bg-white/65 p-4 dark:bg-white/4 md:grid-cols-[minmax(0,1fr)_auto]">
                      <div>
                        <label className={labelClass()}>{VIEW_LABELS[key]}</label>
                        <input value={form.views[key]} onChange={(event) => setView(key, event.target.value)} className={inputClass(key === 'main' && !form.views.main.trim())} placeholder={`/uploads/products/.../${key}.jpg`} />
                      </div>
                      <div className="flex flex-col gap-3 md:items-end">
                        <UploadButton busy={uploadingKey === `view-${key}`} accept="image/png,image/jpeg,image/webp,image/avif" label={key === 'main' ? 'Upload Main' : 'Upload Image'} onSelect={(file) => handleUpload(`view-${key}`, (path) => setView(key, path), file)} />
                        <AssetPreview src={form.views[key]} alt={`${form.name || 'Product'} ${VIEW_LABELS[key]}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/80 dark:text-theme-ivory/76">Gallery</p>
                    <p className="mt-1 text-sm text-black/72 dark:text-theme-ivory/68">Add the gallery images shown in the separate Gallery tab. If you leave it empty, the main image will be reused automatically.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setForm((current) => ({ ...current, gallery: [...current.gallery, ''] }))} className={subtleButtonClass()}>
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Row
                    </button>
                    <UploadButton busy={uploadingKey === 'gallery'} accept="image/png,image/jpeg,image/webp,image/avif" label="Upload" onSelect={(file) => handleUpload('gallery', (path) => setForm((current) => ({ ...current, gallery: [...current.gallery.filter((entry) => entry.trim()), path] })), file)} />
                  </div>
                </div>
                <div className="space-y-3">
                  {form.gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="grid gap-3 rounded-[1.3rem] border border-theme-line/45 bg-white/65 p-4 dark:bg-white/4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
                      <AssetPreview src={image} alt={`${form.name || 'Product'} gallery ${index + 1}`} />
                      <input value={image} onChange={(event) => setForm((current) => ({ ...current, gallery: current.gallery.map((entry, entryIndex) => entryIndex === index ? event.target.value : entry) }))} className={inputClass()} placeholder="/uploads/products/.../gallery-image.jpg" />
                      <button type="button" onClick={() => setForm((current) => ({ ...current, gallery: current.gallery.length > 1 ? current.gallery.filter((_, entryIndex) => entryIndex !== index) : [''] }))} className="rounded-2xl border border-red-200/70 px-4 py-3 text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/80 dark:text-theme-ivory/76">3D Model</p>
                    <p className="mt-1 text-sm text-black/72 dark:text-theme-ivory/68">
                      Upload a `.glb` file only for the live 3D viewer. On Vercel, use a hosted public URL for models instead of relying on local runtime uploads.
                    </p>
                  </div>
                  <UploadButton busy={uploadingKey === 'model'} accept=".glb,model/gltf-binary" label="Upload GLB" onSelect={(file) => handleUpload('model', (path) => setForm((current) => ({ ...current, modelPath: path })), file, 'model')} />
                </div>
                <input value={form.modelPath} onChange={(event) => setForm((current) => ({ ...current, modelPath: event.target.value }))} className={inputClass(form.modelPath.trim() !== '' && !GLB_FILE_PATTERN.test(form.modelPath))} placeholder="/3D%20models/example.glb or https://cdn.example.com/model.glb" />
                <p className="mt-2 text-xs leading-6 text-black/65 dark:text-theme-ivory/62">
                  This field is required for the product viewer and must end with `.glb`. Hosted HTTPS model URLs are supported.
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/80 dark:text-theme-ivory/76">Color Variants</p>
                    <p className="mt-1 text-sm text-black/72 dark:text-theme-ivory/68">Manage the color names and images shown in the Color Variants section. If a swatch image is left blank, the main product image will be reused.</p>
                  </div>
                  <button type="button" onClick={() => setForm((current) => ({ ...current, colors: [...current.colors, { name: '', image: '' }] }))} className={subtleButtonClass()}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Variant
                  </button>
                </div>
                <div className="space-y-3">
                  {form.colors.map((color, index) => (
                    <div key={`${index}-${color.name}`} className="grid gap-3 rounded-[1.3rem] border border-theme-line/45 bg-white/65 p-4 dark:bg-white/4">
                      <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)]">
                        <AssetPreview src={color.image} alt={`${color.name || 'Color'} swatch`} />
                        <div className="grid gap-3">
                          <input value={color.name} onChange={(event) => setForm((current) => ({ ...current, colors: current.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: event.target.value } : entry) }))} className={inputClass()} placeholder="Olive Velvet" />
                          <input value={color.image} onChange={(event) => setForm((current) => ({ ...current, colors: current.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, image: event.target.value } : entry) }))} className={inputClass()} placeholder="/uploads/products/.../color.png" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <UploadButton busy={uploadingKey === `color-${index}`} accept="image/png,image/jpeg,image/webp,image/avif" label="Upload Swatch" onSelect={(file) => handleUpload(`color-${index}`, (path) => setForm((current) => ({ ...current, colors: current.colors.map((entry, entryIndex) => entryIndex === index ? { ...entry, image: path } : entry) })), file)} />
                        {form.colors.length > 1 ? <button type="button" onClick={() => setForm((current) => ({ ...current, colors: current.colors.filter((_, entryIndex) => entryIndex !== index) }))} className="rounded-full border border-red-200/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Remove</button> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-theme-line/50 bg-theme-ivory/45 p-5 dark:bg-white/4">
            <div className="mb-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/80 dark:text-theme-ivory/76">View More Specs</p>
              <p className="mt-1 text-sm text-black/72 dark:text-theme-ivory/68">Edit every written specification row shown inside the product specs panel.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <input value={form.specs.material} onChange={(event) => setSpecField('material', event.target.value)} className={inputClass()} placeholder="Material" />
              <input value={form.specs.foam} onChange={(event) => setSpecField('foam', event.target.value)} className={inputClass()} placeholder="Foam / Fill" />
              <input value={form.specs.dimensions} onChange={(event) => setSpecField('dimensions', event.target.value)} className={inputClass()} placeholder="Dimensions" />
              <input value={form.specs.weight} onChange={(event) => setSpecField('weight', event.target.value)} className={inputClass()} placeholder="Weight" />
              <input value={form.specs.warranty} onChange={(event) => setSpecField('warranty', event.target.value)} className={inputClass()} placeholder="Warranty / Care" />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/72 dark:text-theme-ivory/66">Detailed Spec Sections</p>
              <button type="button" onClick={() => setSpecField('sections', [...form.specs.sections, emptySpecSection()])} className={subtleButtonClass()}>
                <PlusCircle className="h-3.5 w-3.5" />
                Add Section
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {form.specs.sections.map((section, sectionIndex) => (
                <div key={`${sectionIndex}-${section.title}`} className="rounded-[1.4rem] border border-theme-line/50 bg-white/68 p-4 dark:bg-white/4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className={labelClass()}>{`Section ${sectionIndex + 1} Title`}</label>
                      <input value={section.title} onChange={(event) => setSpecField('sections', form.specs.sections.map((entry, entryIndex) => entryIndex === sectionIndex ? { ...entry, title: event.target.value } : entry))} className={inputClass()} placeholder="General Specifications" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setSpecField('sections', form.specs.sections.map((entry, entryIndex) => entryIndex === sectionIndex ? { ...entry, items: [...entry.items, emptySpecItem()] } : entry))} className={subtleButtonClass()}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        Add Row
                      </button>
                      {form.specs.sections.length > 1 ? <button type="button" onClick={() => setSpecField('sections', form.specs.sections.filter((_, entryIndex) => entryIndex !== sectionIndex))} className="rounded-full border border-red-200/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Remove Section</button> : null}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div key={`${sectionIndex}-${itemIndex}`} className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]">
                        <input value={item.label} onChange={(event) => setSpecField('sections', form.specs.sections.map((entry, entryIndex) => entryIndex === sectionIndex ? { ...entry, items: entry.items.map((row, rowIndex) => rowIndex === itemIndex ? { ...row, label: event.target.value } : row) } : entry))} className={inputClass()} placeholder="Label" />
                        <input value={item.value} onChange={(event) => setSpecField('sections', form.specs.sections.map((entry, entryIndex) => entryIndex === sectionIndex ? { ...entry, items: entry.items.map((row, rowIndex) => rowIndex === itemIndex ? { ...row, value: event.target.value } : row) } : entry))} className={inputClass()} placeholder="Value" />
                        <button type="button" onClick={() => setSpecField('sections', form.specs.sections.map((entry, entryIndex) => entryIndex === sectionIndex ? { ...entry, items: entry.items.length > 1 ? entry.items.filter((_, rowIndex) => rowIndex !== itemIndex) : [emptySpecItem()] } : entry))} className="rounded-2xl border border-red-200/70 px-4 py-3 text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {apiError ? (
            <div className="mt-6 flex items-center gap-3 rounded-[1.2rem] border border-red-400/30 bg-red-50/90 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {apiError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--theme-contrast-ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-[0_14px_34px_rgba(34,27,23,0.18)] transition hover:bg-black disabled:opacity-60 sm:w-auto">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving' : editingId ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={closeEditor} className={`${outlineButtonClass()} w-full justify-center px-6 py-3 sm:w-auto`}>
              Cancel
            </button>
          </div>
        </form>
        );

        return portalTarget ? createPortal(formNode, portalTarget) : formNode;
      })() : null}

      {filteredProducts.length ? (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const galleryCount = extractAdditionalGalleryImages(product).length;
            const detailSectionCount = Array.isArray(product.specs?.sections)
              ? product.specs.sections.length
              : 0;
            const isEditingThisProduct = showForm && editingId === product._id;

            return (
              <Fragment key={product._id}>
                <div id={`product-card-${product._id}`} className={`rounded-[1.8rem] border p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5 ${isEditingThisProduct ? 'border-theme-bronze/50 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(247,239,228,0.84))]' : 'border-theme-line/50 bg-white/76'}`}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-[1rem] border border-theme-line/50">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-theme-ink dark:text-theme-ivory">{product.name}</p>
                    <p className="mt-1 text-xs text-black/65 dark:text-theme-ivory/62">
                      Category: {(product.mainCategoryName || product.category) || 'Unassigned'} | Brand: {product.brandName || 'No brand'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Gallery {galleryCount}</span>
                      <span className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Colors {product.colors?.length || 0}</span>
                      <span className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em]">Specs {detailSectionCount}</span>
                      <span className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em]">{product.modelPath && GLB_FILE_PATTERN.test(product.modelPath) ? 'GLB Ready' : 'No GLB'}</span>
                      {isEditingThisProduct ? (
                        <span className="rounded-full border border-theme-bronze/50 bg-theme-bronze/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-theme-bronze">
                          Editing Below
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{formatCurrency(product.finalPrice ?? product.price)}</div>
                    <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">Stock {product.stockQuantity ?? product.stock ?? 0}</div>
                    <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{product.inStock ?? (product.stockQuantity ?? product.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}</div>
                    <div className="rounded-full border border-theme-line/50 bg-theme-ivory/62 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]">{product.active ?? true ? 'Active' : 'Hidden'}</div>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <button type="button" onClick={() => openEdit(product)} className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_8px_20px_rgba(34,27,23,0.06)] sm:flex-none ${isEditingThisProduct ? 'border-black bg-[color:var(--theme-contrast-ink)] text-white dark:border-theme-ivory dark:bg-theme-ivory dark:text-[var(--theme-contrast-ink)]' : 'border-black/15 bg-white text-black hover:border-black/65 hover:bg-stone-100 dark:border-theme-ivory/28 dark:bg-white/8 dark:text-theme-ivory'}`}><Pencil className="h-3.5 w-3.5" />{isEditingThisProduct ? 'Close Edit' : 'Edit'}</button>
                    <button type="button" onClick={() => handleDelete(product._id)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-red-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 sm:flex-none"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                  </div>
                </div>
                </div>
                <div id={`product-editor-slot-${product._id}`} className={isEditingThisProduct ? 'mt-4' : ''} />
              </Fragment>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-theme-line/60 bg-white/60 px-6 py-10 text-center dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/78 dark:text-theme-ivory/76">No Products Yet</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-black/70 dark:text-theme-ivory/66">
            Use Add Product to create the first catalogue item with purchase details, gallery,
            color variants, specs, and a `.glb` model.
          </p>
        </div>
      )}
    </section>
  );
}
