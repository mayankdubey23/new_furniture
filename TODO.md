# 3D View Enhancement Task

## Progress
- [x] Created TODO.md
- [x] Merged the 3D viewer into each product section so the media sits left/right beside the text.
- [x] Removed the standalone full-width 3D blocks that were creating extra gray space.
- [x] Deferred 3D canvas work until the section approaches the viewport and kept image previews fast by default.

## Remaining Steps
1. Replace placeholder preview images with real product renders when assets are available.
2. Compress the `.glb` files in `public/` because the current models are still very large.
3. Clean the existing lint issues in `components/Navbar.jsx` and `app/layout.tsx`.

Next step: optimize model assets outside the current code changes.
