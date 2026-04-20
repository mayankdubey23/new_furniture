'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Boxes, Layers3, Loader2, Tags } from 'lucide-react';
import CatalogCollectionsStudio from '@/components/admin/CatalogCollectionsStudio';
import ProductStudio from '@/components/admin/ProductStudio';
import type { CatalogOptionsResponse } from '@/lib/catalogEntities';
import type { AdminProduct } from '@/lib/adminDashboard';
import { getApiUrl } from '@/lib/api/browser';
import { getAdminPortalPath } from '@/lib/adminPortal';

const defaultCatalogOptions: CatalogOptionsResponse = {
  mainCategories: [],
  subCategories: [],
  brands: [],
};

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
    <div className="rounded-[1.6rem] border border-theme-line/60 bg-white/72 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.06)] dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-theme-bronze">
          {label}
        </p>
        <div className="rounded-2xl border border-theme-line/60 bg-theme-ink p-2 text-white dark:bg-white dark:text-[var(--theme-contrast-ink)]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-6 font-display text-3xl text-theme-ink dark:text-theme-ivory sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
        {note}
      </p>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [catalogOptions, setCatalogOptions] =
    useState<CatalogOptionsResponse>(defaultCatalogOptions);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshWorkspace = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [productsRes, catalogRes] = await Promise.all([
        fetch(getApiUrl('/api/products'), { cache: 'no-store' }),
        fetch(getApiUrl('/api/admin/catalog-options'), {
          credentials: 'include',
          cache: 'no-store',
        }),
      ]);

      const [productData, catalogData] = await Promise.all([
        productsRes.ok ? productsRes.json() : [],
        catalogRes.ok ? catalogRes.json() : defaultCatalogOptions,
      ]);

      setProducts(Array.isArray(productData) ? productData : []);
      setCatalogOptions(catalogData?.mainCategories ? catalogData : defaultCatalogOptions);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  const missingCollections = useMemo(() => {
    const missing: string[] = [];

    if (!catalogOptions.mainCategories.length) {
      missing.push('main category');
    }

    if (!catalogOptions.brands.length) {
      missing.push('brand');
    }

    return missing;
  }, [catalogOptions]);

  const hiddenProducts = useMemo(
    () => products.filter((product) => product.active === false).length,
    [products]
  );

  const linkedEntityCounts = useMemo(() => {
    const maincategory: Record<string, number> = {};
    const brand: Record<string, number> = {};

    products.forEach((product) => {
      const mainCategoryId = String(product.mainCategoryId || '').trim();
      const brandId = String(product.brandId || '').trim();

      if (mainCategoryId) {
        maincategory[mainCategoryId] = (maincategory[mainCategoryId] || 0) + 1;
      }

      if (brandId) {
        brand[brandId] = (brand[brandId] || 0) + 1;
      }
    });

    return {
      maincategory,
      brand,
    };
  }, [products]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-theme-walnut/56 dark:text-theme-ivory/56">
          Loading Products Workspace
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-[2.3rem] border border-theme-line/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(244,232,215,0.82))] p-6 shadow-[0_26px_90px_rgba(49,30,21,0.1)] dark:bg-[linear-gradient(135deg,rgba(54,40,33,0.52),rgba(24,18,15,0.82))] md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.36em] text-theme-bronze">
              Products Workspace
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-theme-ink dark:text-theme-ivory sm:text-4xl md:text-5xl">
              Manage categories and brands first, then build products with a cleaner admin flow.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-theme-walnut/72 dark:text-theme-ivory/66 md:text-base">
              The catalog is the setup layer for product grouping. Main categories and brands
              now live beside product management on one dedicated route, while the product editor
              still keeps full support for images, gallery, color variants, specs, and `.glb`
              models.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={getAdminPortalPath()}
                className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/70 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/6 dark:text-theme-ivory/70"
              >
                Overview
              </Link>
              <Link
                href={getAdminPortalPath('/orders')}
                className="inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-walnut/70 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/6 dark:text-theme-ivory/70"
              >
                Orders
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {refreshing ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-theme-line/60 bg-white/72 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-theme-walnut/66 dark:bg-white/5 dark:text-theme-ivory/64">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-theme-bronze" />
                Syncing products workspace
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Products"
              value={String(products.length)}
              note={`${hiddenProducts} hidden from the storefront right now.`}
              icon={Boxes}
            />
            <StatCard
              label="Main Categories"
              value={String(catalogOptions.mainCategories.length)}
              note="Top-level product groupings for the catalogue."
              icon={Layers3}
            />
            <StatCard
              label="Brands"
              value={String(catalogOptions.brands.length)}
              note="Brand references available in the product editor."
              icon={Tags}
            />
          </div>
        </div>
      </section>

      {missingCollections.length ? (
        <section className="rounded-[1.8rem] border border-amber-400/30 bg-amber-50/80 px-5 py-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          Create at least one {missingCollections.join(' and ')} before adding a complete
          product. The product editor uses those linked selectors while keeping the rest of
          the product setup fully detailed.
        </section>
      ) : null}

      <CatalogCollectionsStudio
        catalogOptions={catalogOptions}
        linkedEntityCounts={linkedEntityCounts}
        onRefresh={() => refreshWorkspace(true)}
      />

      <ProductStudio
        products={products}
        catalogOptions={catalogOptions}
        onRefresh={() => refreshWorkspace(true)}
      />
    </div>
  );
}
