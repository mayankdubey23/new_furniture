# Backend Integration

## Project Structure

- `lib/api/browser.ts`: resolves client-side API URLs for `internal`, `external`, and `mock` modes
- `lib/api/server.ts`: server-side source selection and remote fetch helpers
- `lib/api/externalRoutes.ts`: local-to-backend route mapping for external API mode
- `lib/services/storefront.ts`: dynamic product and collection reads
- `lib/services/siteContent.ts`: dynamic hero/footer copy and video sources
- `lib/content/siteContent.ts`: content types and default media config
- `mock-api/db.json`: JSON Server mock dataset
- `mock-api/routes.json`: route aliases that match the app's `/api/*` paths
- `proxy.ts`: same-origin API rewrite layer for browser requests in `external` mode

## Data Source Modes

Use one of these values:

- `NEXT_PUBLIC_DATA_SOURCE=internal`
- `NEXT_PUBLIC_DATA_SOURCE=external`
- `NEXT_PUBLIC_DATA_SOURCE=mock`

Optional server-side override:

- `DATA_SOURCE=external`

## External Backend Settings

When your separate backend is ready, set:

- `NEXT_PUBLIC_EXTERNAL_API_BASE_URL=https://your-backend.example.com`
- `EXTERNAL_API_BASE_URL=https://your-backend.example.com`
- `EXTERNAL_API_BEARER_TOKEN=your-backend-bearer-token`
- `EXTERNAL_PRODUCTS_PATH=/api/product`
- `EXTERNAL_SITE_CONTENT_PATH=/api/site-content`

The server fetch helper will automatically send:

```http
Authorization: Bearer <EXTERNAL_API_BEARER_TOKEN>
```

when the source is `external` and the token is configured. Keep this token server-side only.

Browser calls should continue to hit local `/api/*` URLs. In `external` mode, `proxy.ts` rewrites the supported routes to your backend and adds the bearer token there, so the client never needs direct access to that secret.

The built-in route mapping covers:

- `/api/products` and `/api/product` -> backend `/api/product`
- `/api/maincategories` and `/api/maincategory` -> backend `/api/maincategory`
- `/api/subcategories` and `/api/subcategory` -> backend `/api/subcategory`
- `/api/brands` and `/api/brand` -> backend `/api/brand`
- `/api/settings` and `/api/setting` -> backend `/api/setting`
- `/api/faqs` and `/api/faq` -> backend `/api/faq`
- `/api/features` and `/api/feature` -> backend `/api/feature`
- `/api/testimonials` and `/api/testimonial` -> backend `/api/testimonial`
- `/api/newsletters` and `/api/newsletter` -> backend `/api/newsletter`
- `/api/addresses` and `/api/address` -> backend `/api/address`
- `/api/users` and `/api/user` -> backend `/api/user`
- `/api/carts` and `/api/cart` -> backend `/api/cart`
- `/api/wishlists` and `/api/wishlist` -> backend `/api/wishlist`
- `/api/contactus` -> backend `/api/contactus`
- `/api/orders` and `/api/checkout` -> backend `/api/checkout`

The storefront server adapters are also prepared to consume:

- `GET /api/product`
- `GET /api/product/:id`
- `GET /api/site-content`

## JSON Mock Server

Use the included mock dataset with:

```bash
npm run mock:server
```

Recommended mock env:

```bash
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_MOCK_API_BASE_URL=http://localhost:4000
```

## Current Limits

- JSON Server is suitable for content and CRUD-style resources.
- Auth, OTP, payment verification, and any route names that differ from the built-in mapping still need your real backend contracts or env overrides.
- The `Api Testing` folder in this repo contains screenshots only, not an importable Postman or Insomnia collection, so endpoint contracts still need to come from the backend team in a machine-readable form if you want the remaining flows wired end-to-end.
