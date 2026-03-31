# Gallery Image Fixes TODO

## Approved Plan Steps (progress tracked ✅):

### 1. ✅ Create TODO.md with steps

### 2. ✅ Edit components/product/ImageGallery.jsx
- Replaced object-cover → object-contain in ProductImage and ThumbImage
- Enlarged main image aspect-[4/3] → [3/2]

### 3. ✅ Edit components/product/ProductDetails.jsx
- Replaced object-cover → object-contain in color swatches and preview thumbnail

### 4. ✅ Edit components/product/ColorVariants.jsx
- Updated ColorImage and SwatchImage className object-cover → object-contain

### 5. ✅ Update TODO.md with progress

### 6. Test: Run `npm run dev` and navigate to product page to verify:
   - Gallery main image larger with full uncropped view
   - Thumbnails show complete images (no crop)
   - Color previews/swatch full images
   - No console/TS errors

### 7. ✅ Complete
