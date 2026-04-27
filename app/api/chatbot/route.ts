import { NextRequest, NextResponse } from 'next/server';
import { SITE_CONTACT_EMAIL, SITE_NAME } from '@/lib/brand';
import { getStorefrontProducts } from '@/lib/services/storefront';
import { getProductSlug, type ProductRecord } from '@/lib/productCatalog';

export const dynamic = 'force-dynamic';

type ChatbotPayload = {
  message?: string;
};

type SuggestedProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  href: string;
  colors: string[];
};

const INTENT_KEYWORDS = {
  greeting: ['hi', 'hello', 'hey', 'namaste'],
  customize: ['custom', 'customise', 'customize', 'fabric', 'color', 'colour', 'material', 'finish'],
  price: ['price', 'cost', 'budget', 'cheap', 'affordable', 'under', 'below', 'range'],
  delivery: ['delivery', 'ship', 'shipping', 'pincode', 'deliver', 'timeline'],
  order: ['order', 'track', 'tracking', 'status'],
  contact: ['contact', 'call', 'email', 'support', 'help'],
  sofa: ['sofa', 'sofas', 'couch', 'couches', 'sectional', 'sectionals'],
  chair: ['chair', 'chairs', 'seat', 'seating', 'armchair', 'armchairs'],
  recliner: ['recliner', 'recliners', 'lounge', 'lounger', 'relax'],
  pouffe: ['pouffe', 'pouffes', 'ottoman', 'ottomans', 'stool', 'stools'],
};

const PRODUCT_INTENT_KEYWORDS = [
  ...INTENT_KEYWORDS.sofa,
  ...INTENT_KEYWORDS.chair,
  ...INTENT_KEYWORDS.recliner,
  ...INTENT_KEYWORDS.pouffe,
  'product',
  'products',
  'collection',
  'collections',
  'furniture',
  'show',
  'browse',
  'recommend',
  'suggest',
];
const CATALOG_QUICK_REPLIES = [
  'Show sofas',
  'Show chairs',
  'Show recliners',
  'Show pouffes',
];
const DEFAULT_QUICK_REPLIES = [
  ...CATALOG_QUICK_REPLIES,
  'Customize a product',
  'Report a problem',
  'Talk to executive',
];

function cleanMessage(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 500) : '';
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function includesAny(message: string, keywords: string[]) {
  const words: string[] = message.match(/[a-z0-9]+/g) ?? [];

  return keywords.some((keyword) => {
    const normalizedKeyword = keyword.toLowerCase();

    if (normalizedKeyword.includes(' ')) {
      return message.includes(normalizedKeyword);
    }

    return words.includes(normalizedKeyword);
  });
}

function extractBudget(message: string) {
  const match = message.match(/(?:under|below|less than|upto|up to)\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i);

  if (!match) {
    return null;
  }

  const budget = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(budget) && budget > 0 ? budget : null;
}

function toSuggestedProduct(product: ProductRecord): SuggestedProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.mainCategoryName || product.category,
    price: product.finalPrice || product.price,
    image: product.imageUrl,
    href: `/products/${encodeURIComponent(getProductSlug(product))}`,
    colors: product.color.slice(0, 4),
  };
}

function findProductMatches(message: string, products: ProductRecord[]) {
  const categoryKeyword = Object.entries({
    sofa: INTENT_KEYWORDS.sofa,
    chair: INTENT_KEYWORDS.chair,
    recliner: INTENT_KEYWORDS.recliner,
    pouffe: INTENT_KEYWORDS.pouffe,
  }).find(([, keywords]) => includesAny(message, keywords))?.[0];
  const budget = extractBudget(message);
  const hasProductIntent =
    Boolean(categoryKeyword) ||
    Boolean(budget) ||
    includesAny(message, PRODUCT_INTENT_KEYWORDS) ||
    includesAny(message, INTENT_KEYWORDS.price);

  if (!hasProductIntent) {
    return [];
  }

  let matches = products;

  if (categoryKeyword) {
    matches = matches.filter((product) => {
      const searchable = [
        product.category,
        product.name,
        product.mainCategoryName,
        product.subCategoryName,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(categoryKeyword);
    });
  }

  if (budget) {
    matches = matches.filter((product) => (product.finalPrice || product.price) <= budget);
  }

  if (!matches.length && budget) {
    matches = products.filter((product) => (product.finalPrice || product.price) <= budget);
  }

  return matches
    .slice()
    .sort((first, second) => (first.finalPrice || first.price) - (second.finalPrice || second.price))
    .slice(0, 3);
}

function buildCatalogSummary(products: ProductRecord[]) {
  const visibleProducts = products.slice(0, 4);
  const lines = visibleProducts.map((product) => {
    const price = formatCurrency(product.finalPrice || product.price);
    return `${product.name} starts at ${price}`;
  });

  return `I can help you choose from ${SITE_NAME}'s sofas, chairs, recliners, and pouffes. ${lines.join(', ')}.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatbotPayload;
    const rawMessage = cleanMessage(body.message);
    const message = rawMessage.toLowerCase();
    const products = await getStorefrontProducts();
    const matchedProducts = findProductMatches(message, products);
    const suggestions = matchedProducts.map(toSuggestedProduct);

    if (!rawMessage) {
      return NextResponse.json(
        {
          message: 'Tell me what room, style, product, or budget you have in mind and I will point you to the right pieces.',
          quickReplies: DEFAULT_QUICK_REPLIES,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (includesAny(message, INTENT_KEYWORDS.greeting)) {
      return NextResponse.json(
        {
          message: `Hello, welcome to ${SITE_NAME}. I can help with product recommendations, customization, delivery, order tracking, or support.`,
          quickReplies: DEFAULT_QUICK_REPLIES,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (includesAny(message, INTENT_KEYWORDS.order)) {
      return NextResponse.json(
        {
          message: 'You can track an order with your order ID or tracking number on the Track Order page. Keep the order email handy for verification.',
          action: { label: 'Track order', href: '/track-order' },
          quickReplies: [...CATALOG_QUICK_REPLIES, 'Talk to executive', 'Customize a product'],
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (includesAny(message, INTENT_KEYWORDS.customize)) {
      const productText = suggestions.length
        ? ` A good starting point is ${suggestions[0].name}, which supports material, finish, color, and add-on choices.`
        : '';

      return NextResponse.json(
        {
          message: `Yes, customization is available for selected furniture.${productText} You can share size, color, material, finish, and delivery details in the customization studio.`,
          suggestions,
          action: { label: 'Open customization', href: '/customization' },
          quickReplies: [...CATALOG_QUICK_REPLIES, 'What is the price range?', 'Delivery details'],
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (includesAny(message, INTENT_KEYWORDS.delivery)) {
      return NextResponse.json(
        {
          message: 'Delivery details are collected during checkout or customization. For customized furniture, the studio asks for your India address and expected timeline so the team can confirm feasibility before production.',
          action: { label: 'Start customization', href: '/customization' },
          quickReplies: [...CATALOG_QUICK_REPLIES, 'Track my order', 'Talk to executive'],
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (includesAny(message, INTENT_KEYWORDS.contact)) {
      return NextResponse.json(
        {
          message: `For help with products, orders, or customization, you can use the contact page or email ${SITE_CONTACT_EMAIL}.`,
          action: { label: 'Contact us', href: '/contact' },
          quickReplies: ['Talk to executive', 'Track my order', ...CATALOG_QUICK_REPLIES],
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (
      includesAny(message, INTENT_KEYWORDS.price) ||
      suggestions.length ||
      includesAny(message, [
        ...INTENT_KEYWORDS.sofa,
        ...INTENT_KEYWORDS.chair,
        ...INTENT_KEYWORDS.recliner,
        ...INTENT_KEYWORDS.pouffe,
      ])
    ) {
      const answerProducts = suggestions.length ? suggestions : products.slice(0, 3).map(toSuggestedProduct);
      const intro = suggestions.length
        ? 'Here are the best matches I found from the current catalog.'
        : buildCatalogSummary(products);
      const productLine = answerProducts
        .map((product) => `${product.name} at ${formatCurrency(product.price)}`)
        .join('; ');

      return NextResponse.json(
        {
          message: `${intro} ${productLine}.`,
          suggestions: answerProducts,
          quickReplies: [...CATALOG_QUICK_REPLIES, 'Customize one', 'Track my order'],
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      {
        message: 'I can help with furniture recommendations, prices, customization, delivery, order tracking, and support. Try asking for a product type or tell me your budget.',
        quickReplies: DEFAULT_QUICK_REPLIES,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      {
        message: 'I could not load the store assistant right now. Please try again or use the contact page for support.',
        action: { label: 'Contact us', href: '/contact' },
      },
      { status: 500 }
    );
  }
}
