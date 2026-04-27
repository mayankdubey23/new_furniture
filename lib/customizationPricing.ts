import type { ProductRecord } from '@/lib/productCatalog';

type QuoteLineId =
  | 'base-product'
  | 'configuration'
  | 'featured-color'
  | 'custom-color'
  | 'material'
  | 'finish'
  | 'addon';

type CategorySettings = {
  materials: string[];
  finishes: string[];
  addons: string[];
  defaultFinish: string;
  defaultConfiguration?: string;
  materialRates: Record<string, number>;
  finishRates: Record<string, number>;
  configurationFactors?: Record<string, number>;
  addonPrices: Record<string, number>;
};

export type CustomizationOptionProfile = {
  materials: string[];
  finishes: string[];
  addons: string[];
  defaults: {
    color: string;
    material: string;
    finish: string;
    configuration: string;
  };
};

export type CustomizationQuoteLine = {
  id: QuoteLineId | `addon-${string}`;
  label: string;
  description: string;
  unitAmount: number;
  totalAmount: number;
  included: boolean;
};

export type CustomizationQuote = {
  currency: 'INR';
  quantity: number;
  baseUnitPrice: number;
  customizedUnitPrice: number;
  baseTotal: number;
  adjustmentsTotal: number;
  grandTotal: number;
  defaults: CustomizationOptionProfile['defaults'];
  selections: {
    color: string;
    material: string;
    finish: string;
    configuration: string;
    addons: string[];
  };
  lines: CustomizationQuoteLine[];
};

export type CustomizationQuoteInput = {
  product?: ProductRecord | null;
  quantity?: number;
  selectedFeaturedColorName?: string;
  customColorName?: string;
  selectedMaterial?: string;
  selectedFinish?: string;
  selectedAddons?: string[];
  sizeOrConfiguration?: string;
};

const GENERIC_MATERIAL_RATES: Record<string, number> = {
  Leather: 0.14,
  Velvet: 0.08,
  Boucle: 0.06,
  Linen: 0.04,
  'Premium Fabric': 0.03,
};

const GENERIC_FINISH_RATES: Record<string, number> = {
  'Dark Walnut': 0,
  'Natural Oak': 0.02,
  'Matte Black': 0.025,
  'Brushed Brass': 0.04,
  'Polished Nickel': 0.05,
};

const GENERIC_ADDON_PRICES: Record<string, number> = {
  'Premium Cushion Fill': 1800,
  'Accent Stitching': 1200,
  'Extended Depth': 3500,
  'Swivel Base': 4200,
};

const SOFA_CONFIGURATION_FACTORS: Record<string, number> = {
  'One-Seater': 0.62,
  'Two-Seater': 0.82,
  'Three-Seater': 1,
  '3+2+1 Sofa Sets': 1.78,
  'L-shaped Sofas': 1.42,
};

const CATEGORY_SETTINGS: Record<string, CategorySettings> = {
  sofa: {
    materials: ['Leather', 'Velvet', 'Boucle', 'Linen', 'Premium Fabric'],
    finishes: ['Dark Walnut', 'Matte Black', 'Brushed Brass'],
    addons: ['Premium Cushion Fill', 'Accent Stitching', 'Extended Depth'],
    defaultFinish: 'Dark Walnut',
    defaultConfiguration: 'Three-Seater',
    materialRates: GENERIC_MATERIAL_RATES,
    finishRates: GENERIC_FINISH_RATES,
    configurationFactors: SOFA_CONFIGURATION_FACTORS,
    addonPrices: GENERIC_ADDON_PRICES,
  },
  chair: {
    materials: ['Leather', 'Velvet', 'Boucle', 'Linen', 'Premium Fabric'],
    finishes: ['Dark Walnut', 'Natural Oak', 'Brushed Brass'],
    addons: ['Premium Cushion Fill', 'Accent Stitching', 'Swivel Base'],
    defaultFinish: 'Dark Walnut',
    materialRates: GENERIC_MATERIAL_RATES,
    finishRates: GENERIC_FINISH_RATES,
    addonPrices: GENERIC_ADDON_PRICES,
  },
  recliner: {
    materials: ['Leather', 'Premium Fabric', 'Velvet'],
    finishes: ['Dark Walnut', 'Matte Black', 'Polished Nickel'],
    addons: ['Premium Cushion Fill', 'Accent Stitching', 'Extended Depth'],
    defaultFinish: 'Dark Walnut',
    materialRates: GENERIC_MATERIAL_RATES,
    finishRates: GENERIC_FINISH_RATES,
    addonPrices: GENERIC_ADDON_PRICES,
  },
  pouffe: {
    materials: ['Velvet', 'Boucle', 'Linen', 'Premium Fabric'],
    finishes: ['Natural Oak', 'Matte Black', 'Brushed Brass'],
    addons: ['Premium Cushion Fill', 'Accent Stitching'],
    defaultFinish: 'Natural Oak',
    materialRates: GENERIC_MATERIAL_RATES,
    finishRates: GENERIC_FINISH_RATES,
    addonPrices: GENERIC_ADDON_PRICES,
  },
};

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function roundPrice(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value / 100) * 100;
}

function clampPositive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => cleanString(value)).filter(Boolean)));
}

function normalizeConfiguration(value: string) {
  const normalized = cleanString(value).toLowerCase().replace(/[^a-z0-9+]+/g, '');

  const lookup: Record<string, string> = {
    oneseater: 'One-Seater',
    singlestatementseat: 'One-Seater',
    twoseater: 'Two-Seater',
    loveseat: 'Two-Seater',
    threeseater: 'Three-Seater',
    '3seater': 'Three-Seater',
    '3+2+1sofasets': '3+2+1 Sofa Sets',
    '321sofasets': '3+2+1 Sofa Sets',
    lshapedsofas: 'L-shaped Sofas',
    lshaped: 'L-shaped Sofas',
  };

  return lookup[normalized] || cleanString(value);
}

function resolveMaterialFromProduct(product?: ProductRecord | null, materials: string[] = []) {
  const rawMaterial = cleanString(product?.specs?.material).toLowerCase();

  if (rawMaterial.includes('boucle') && materials.includes('Boucle')) return 'Boucle';
  if (rawMaterial.includes('linen') && materials.includes('Linen')) return 'Linen';
  if (rawMaterial.includes('velvet') && materials.includes('Velvet')) return 'Velvet';
  if (rawMaterial.includes('leather') && materials.includes('Leather')) return 'Leather';
  if (
    (rawMaterial.includes('fabric') || rawMaterial.includes('polyester')) &&
    materials.includes('Premium Fabric')
  ) {
    return 'Premium Fabric';
  }

  return materials[0] || '';
}

function resolveColorFromProduct(product?: ProductRecord | null) {
  if (Array.isArray(product?.colors) && product.colors.length) {
    return cleanString(product.colors[0]?.name);
  }

  if (Array.isArray(product?.color) && product.color.length) {
    return cleanString(product.color[0]);
  }

  return '';
}

function resolveConfigurationFromProduct(
  product: ProductRecord | null | undefined,
  settings?: CategorySettings
) {
  if (!settings?.configurationFactors) {
    return '';
  }

  const productSize = Array.isArray(product?.size) && product?.size.length ? product.size[0] : '';
  const normalizedSize = normalizeConfiguration(productSize);

  if (normalizedSize && settings.configurationFactors[normalizedSize]) {
    return normalizedSize;
  }

  return settings.defaultConfiguration || '';
}

function getCategorySettings(product?: ProductRecord | null) {
  const categoryKey = cleanString(product?.category).toLowerCase();
  return CATEGORY_SETTINGS[categoryKey];
}

export function getCustomizationOptionProfile(product?: ProductRecord | null): CustomizationOptionProfile {
  const settings = getCategorySettings(product);
  const materials = settings?.materials || [];
  const finishes = settings?.finishes || [];
  const defaults = {
    color: resolveColorFromProduct(product),
    material: resolveMaterialFromProduct(product, materials),
    finish: settings?.defaultFinish || finishes[0] || '',
    configuration: resolveConfigurationFromProduct(product, settings),
  };

  return {
    materials,
    finishes,
    addons: settings?.addons || [],
    defaults,
  };
}

function buildAdjustmentLine(
  id: CustomizationQuoteLine['id'],
  label: string,
  description: string,
  unitAmount: number,
  quantity: number
): CustomizationQuoteLine {
  const roundedUnitAmount = roundPrice(unitAmount);

  return {
    id,
    label,
    description,
    unitAmount: roundedUnitAmount,
    totalAmount: roundedUnitAmount * quantity,
    included: roundedUnitAmount !== 0,
  };
}

export function buildCustomizationQuote({
  product,
  quantity = 1,
  selectedFeaturedColorName = '',
  customColorName = '',
  selectedMaterial = '',
  selectedFinish = '',
  selectedAddons = [],
  sizeOrConfiguration = '',
}: CustomizationQuoteInput): CustomizationQuote {
  const normalizedQuantity = Math.max(1, Number.isFinite(Number(quantity)) ? Number(quantity) : 1);
  const optionProfile = getCustomizationOptionProfile(product);
  const settings = getCategorySettings(product);
  const baseUnitPrice = roundPrice(
    clampPositive(Number(product?.finalPrice ?? product?.price ?? product?.basePrice ?? 0))
  );
  const baseTotal = baseUnitPrice * normalizedQuantity;

  const selectedConfiguration = normalizeConfiguration(sizeOrConfiguration) || optionProfile.defaults.configuration;
  const selectedColor = cleanString(customColorName) || cleanString(selectedFeaturedColorName) || optionProfile.defaults.color;
  const selectedMaterialValue = cleanString(selectedMaterial) || optionProfile.defaults.material;
  const selectedFinishValue = cleanString(selectedFinish) || optionProfile.defaults.finish;
  const selectedAddonValues = dedupeStrings(selectedAddons);

  const lines: CustomizationQuoteLine[] = [
    {
      id: 'base-product',
      label: 'Ready product price',
      description: product?.name
        ? `${product.name} in its standard ready-made specification`
        : 'Standard ready-made specification',
      unitAmount: baseUnitPrice,
      totalAmount: baseTotal,
      included: true,
    },
  ];

  if (settings?.configurationFactors && optionProfile.defaults.configuration && selectedConfiguration) {
    const defaultFactor =
      settings.configurationFactors[optionProfile.defaults.configuration] ?? 1;
    const selectedFactor = settings.configurationFactors[selectedConfiguration] ?? defaultFactor;

    if (selectedFactor !== defaultFactor) {
      lines.push(
        buildAdjustmentLine(
          'configuration',
          'Configuration change',
          `${optionProfile.defaults.configuration} -> ${selectedConfiguration}`,
          baseUnitPrice * (selectedFactor - defaultFactor),
          normalizedQuantity
        )
      );
    }
  }

  if (
    selectedColor &&
    optionProfile.defaults.color &&
    selectedColor.toLowerCase() !== optionProfile.defaults.color.toLowerCase()
  ) {
    if (cleanString(customColorName)) {
      lines.push(
        buildAdjustmentLine(
          'custom-color',
          'Custom color development',
          `${optionProfile.defaults.color} -> ${selectedColor}`,
          Math.max(1500, roundPrice(baseUnitPrice * 0.06)),
          normalizedQuantity
        )
      );
    } else {
      lines.push(
        buildAdjustmentLine(
          'featured-color',
          'Alternative featured color',
          `${optionProfile.defaults.color} -> ${selectedColor}`,
          Math.max(600, roundPrice(baseUnitPrice * 0.02)),
          normalizedQuantity
        )
      );
    }
  }

  if (selectedMaterialValue && optionProfile.defaults.material && settings?.materialRates) {
    const defaultMaterialRate = settings.materialRates[optionProfile.defaults.material] ?? 0;
    const selectedMaterialRate = settings.materialRates[selectedMaterialValue] ?? defaultMaterialRate;

    if (selectedMaterialRate !== defaultMaterialRate) {
      lines.push(
        buildAdjustmentLine(
          'material',
          'Material upgrade',
          `${optionProfile.defaults.material} -> ${selectedMaterialValue}`,
          baseUnitPrice * (selectedMaterialRate - defaultMaterialRate),
          normalizedQuantity
        )
      );
    }
  }

  if (selectedFinishValue && optionProfile.defaults.finish && settings?.finishRates) {
    const defaultFinishRate = settings.finishRates[optionProfile.defaults.finish] ?? 0;
    const selectedFinishRate = settings.finishRates[selectedFinishValue] ?? defaultFinishRate;

    if (selectedFinishRate !== defaultFinishRate) {
      lines.push(
        buildAdjustmentLine(
          'finish',
          'Finish change',
          `${optionProfile.defaults.finish} -> ${selectedFinishValue}`,
          baseUnitPrice * (selectedFinishRate - defaultFinishRate),
          normalizedQuantity
        )
      );
    }
  }

  selectedAddonValues.forEach((addon) => {
    const addonPrice = roundPrice(settings?.addonPrices[addon] ?? GENERIC_ADDON_PRICES[addon] ?? 1200);

    lines.push({
      id: `addon-${addon.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: addon,
      description: 'Optional studio add-on',
      unitAmount: addonPrice,
      totalAmount: addonPrice * normalizedQuantity,
      included: addonPrice !== 0,
    });
  });

  const adjustmentsTotal = lines
    .filter((line) => line.id !== 'base-product')
    .reduce((sum, line) => sum + line.totalAmount, 0);

  const customizedUnitPrice = Math.max(
    0,
    baseUnitPrice +
      lines
        .filter((line) => line.id !== 'base-product')
        .reduce((sum, line) => sum + line.unitAmount, 0)
  );

  return {
    currency: 'INR',
    quantity: normalizedQuantity,
    baseUnitPrice,
    customizedUnitPrice,
    baseTotal,
    adjustmentsTotal,
    grandTotal: Math.max(0, baseTotal + adjustmentsTotal),
    defaults: optionProfile.defaults,
    selections: {
      color: selectedColor,
      material: selectedMaterialValue,
      finish: selectedFinishValue,
      configuration: selectedConfiguration,
      addons: selectedAddonValues,
    },
    lines,
  };
}
