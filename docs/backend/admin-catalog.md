# Admin Catalog Backend Guide

This project now has a working admin catalog flow for products, uploads, and storefront sync.

## Legacy Local Backend Files

These files document the frontend contract and legacy local implementation. In
normal `external` mode, `proxy.ts` forwards `/api/*` calls to the separate
backend instead of using these Mongo-backed routes.

- `app/api/maincategories/route.ts`
  Main category list and creation.
- `app/api/maincategories/[id]/route.ts`
  Single main category read, update, and delete.
- `app/api/subcategories/route.ts`
  Subcategory list and creation.
- `app/api/subcategories/[id]/route.ts`
  Single subcategory read, update, and delete.
- `app/api/brands/route.ts`
  Brand list and creation.
- `app/api/brands/[id]/route.ts`
  Single brand read, update, and delete.
- `app/api/admin/catalog-options/route.ts`
  Combined admin options payload for main categories, subcategories, and brands.
- `app/api/products/route.ts`
  Product list and product creation.
- `app/api/products/[id]/route.ts`
  Single product read, update, and delete.
- `app/api/admin/uploads/route.ts`
  Admin-only upload endpoint for product images and 3D models.
- `lib/productCatalog.ts`
  Shared catalog schema, normalization, defaults, and mutation validation.
- `lib/productStore.ts`
  Server-side product loading helpers used by the storefront.
- `lib/server/uploadStorage.ts`
  Shared file upload/storage helper.
- `lib/server/catalogRevalidation.ts`
  Shared route revalidation helper after catalog mutations.
- `types/backend/catalog.ts`
  Request/response DTO reference for backend work.

## Product Shape

Products are stored with:

- `mainCategory`
- `subCategory`
- `brand`
- `mainCategoryName`
- `subCategoryName`
- `brandName`
- `basePrice`
- `discount`
- `finalPrice`
- `inStock`
- `stockQuantity`
- `size`
- `pic`
- `color`
- `active`
- `category`
- `name`
- `description`
- `price`
- `stock`
- `imageUrl`
- `eyebrow`
- `modelPath`
- `images`
- `colors`
- `specs`
- `media.views`
- `media.gallery`

Named image views supported today:

- `main`
- `cover`
- `left`
- `right`
- `top`
- `detail`

## Upload Flow

The admin upload endpoint accepts `multipart/form-data`.

Required fields:

- `file`
- `category`
- `productName`
- `slot`
- `kind`

`kind` values:

- `image`
- `model`

Optional catalog upload fields:

- `scope=catalog`
- `collection=maincategory|subcategory|brand`
- `entityName`

Uploaded files are stored under:

`public/uploads/products/<category>/<product-name>/<images|models>/`

Catalog entity images are stored under:

`public/uploads/<collection>/`

This is configurable through:

- `PRODUCT_UPLOAD_ROOT`
- `PRODUCT_UPLOAD_PUBLIC_BASE`

## Storefront Sync

The homepage no longer depends only on a hardcoded product array.

- `app/page.tsx` loads live products through `lib/productStore.ts`
- product mutations call `revalidateCatalogRoutes(...)`
- storefront sections stay aligned with admin changes

## External Backend Workflow

1. Set `NEXT_PUBLIC_DATA_SOURCE=external` and `DATA_SOURCE=external`.
2. Set `EXTERNAL_API_BASE_URL` and `NEXT_PUBLIC_EXTERNAL_API_BASE_URL` to the backend URL.
3. Set `PUBLIC_KEY` if the backend requires the configured public key headers.
4. Keep the admin panel and storefront calling the same frontend `/api/*` paths.
5. Ensure the backend returns product/category/brand image fields in the shapes documented here.

## Recommended Next Backend Improvements

- move uploads to S3, Cloudinary, or another durable storage provider for production
- add audit logging for admin mutations
- add request-level validation with a schema library if the API surface grows
- add integration tests around product create/update/delete and upload flows
