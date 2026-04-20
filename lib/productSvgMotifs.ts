export const PRODUCT_SVG_MOTIFS = {
  cushion: encodeURI('/svg/Brown cushion with shaded details.svg'),
  chair: encodeURI('/svg/Chair.svg'),
  recliner: encodeURI('/svg/Comfortable beige recliner chair.svg'),
  pouffe: encodeURI('/svg/pouffe.svg'),
  sofa: encodeURI('/svg/Sofa-lineart.svg'),
} as const;

export const COLORED_CUSHION_SVG_MOTIFS = {
  velvet: encodeURI('/svg/colors/velvet.svg'),
  bronze: encodeURI('/svg/colors/bronze.svg'),
  ivory: encodeURI('/svg/colors/ivory.svg'),
  olive: encodeURI('/svg/colors/olive.svg'),
  walnut: encodeURI('/svg/colors/walnut.svg'),
  clay: encodeURI('/svg/colors/clay.svg'),
  teal: encodeURI('/svg/colors/teal.svg'),
  rose: encodeURI('/svg/colors/rose.svg'),
  sage: encodeURI('/svg/colors/sage.svg'),
  caramel: encodeURI('/svg/colors/caramel.svg'),
  pearl: encodeURI('/svg/colors/pearl.svg'),
  moss: encodeURI('/svg/colors/moss.svg'),
} as const;

export function getProductSvgMotif(category?: string | null) {
  const normalized = String(category || '').trim().toLowerCase();

  if (normalized === 'sofa') return PRODUCT_SVG_MOTIFS.sofa;
  if (normalized === 'chair') return PRODUCT_SVG_MOTIFS.chair;
  if (normalized === 'recliner') return PRODUCT_SVG_MOTIFS.recliner;
  if (normalized === 'pouffe') return PRODUCT_SVG_MOTIFS.pouffe;

  return PRODUCT_SVG_MOTIFS.cushion;
}

export function getColoredCushionSvgMotif(name?: string | null) {
  const normalized = String(name || '').trim().toLowerCase() as keyof typeof COLORED_CUSHION_SVG_MOTIFS;

  return COLORED_CUSHION_SVG_MOTIFS[normalized] ?? PRODUCT_SVG_MOTIFS.cushion;
}
