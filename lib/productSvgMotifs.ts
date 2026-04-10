export const PRODUCT_SVG_MOTIFS = {
  cushion: encodeURI('/svg/Brown cushion with shaded details.svg'),
  chair: encodeURI('/svg/Chair.svg'),
  recliner: encodeURI('/svg/Comfortable beige recliner chair.svg'),
  pouffe: encodeURI('/svg/pouffe.svg'),
  sofa: encodeURI('/svg/Sofa-lineart.svg'),
} as const;

export function getProductSvgMotif(category?: string | null) {
  const normalized = String(category || '').trim().toLowerCase();

  if (normalized === 'sofa') return PRODUCT_SVG_MOTIFS.sofa;
  if (normalized === 'chair') return PRODUCT_SVG_MOTIFS.chair;
  if (normalized === 'recliner') return PRODUCT_SVG_MOTIFS.recliner;
  if (normalized === 'pouffe') return PRODUCT_SVG_MOTIFS.pouffe;

  return PRODUCT_SVG_MOTIFS.cushion;
}
