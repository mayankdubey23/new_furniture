# Backend Integration

## Project Structure

- `lib/api/browser.ts`: resolves client-side API URLs for `internal`, `external`, and `mock` modes
- `lib/api/server.ts`: server-side source selection and remote fetch helpers
- `lib/services/storefront.ts`: dynamic product and collection reads
- `lib/services/siteContent.ts`: dynamic hero/footer copy and video sources
- `lib/content/siteContent.ts`: content types and default media config
- `mock-api/db.json`: JSON Server mock dataset
- `mock-api/routes.json`: route aliases that match the app's `/api/*` paths

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
- `EXTERNAL_PRODUCTS_PATH=/api/products`
- `EXTERNAL_SITE_CONTENT_PATH=/api/site-content`

The storefront is now prepared to consume:

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/site-content`

Client-side screens also resolve their API calls through the shared browser helper, so changing the base URL does not require another component-by-component refactor.

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
- Auth, OTP, payment verification, tracking lookups, and other custom POST workflows still need your real backend contracts.
