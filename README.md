# Luxe Furniture Storefront

Next.js 16 storefront and admin panel for a luxury furniture catalog with 3D product views, dynamic media, checkout, and admin tooling.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run mock:server
```

## Dynamic Data Modes

The app now supports three data sources:

- `internal`: current Next.js routes and Mongo-backed server logic
- `external`: your separate backend
- `mock`: JSON Server using `mock-api/db.json`

Set one of these:

```bash
NEXT_PUBLIC_DATA_SOURCE=internal
NEXT_PUBLIC_DATA_SOURCE=external
NEXT_PUBLIC_DATA_SOURCE=mock
```

Optional API base URLs:

```bash
NEXT_PUBLIC_EXTERNAL_API_BASE_URL=https://your-backend.example.com
EXTERNAL_API_BASE_URL=https://your-backend.example.com
NEXT_PUBLIC_MOCK_API_BASE_URL=http://localhost:4000
```

## Structure

- `app/`: App Router pages and route handlers
- `components/`: UI, admin tools, product views, decor, and canvas scenes
- `lib/api/`: browser and server API helpers
- `lib/services/`: dynamic data adapters for storefront and site content
- `lib/content/`: content schemas and defaults
- `lib/mocks/`: server-only mock database reader
- `mock-api/`: JSON Server dataset and route aliases
- `docs/backend-integration.md`: backend handoff notes

## Dynamic Content

Homepage hero and footer videos are no longer hardcoded in the components. They now come from the site content service, which can be powered by:

- local defaults
- JSON mock data
- your external backend

## Backend Handoff

See [docs/backend-integration.md](/docs/backend-integration.md) for the env setup, mock server details, and the minimum endpoints already wired into the storefront.
