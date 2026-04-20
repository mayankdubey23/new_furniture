import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import {
  buildCommerceItemId,
  cleanCommerceString,
  cleanCommerceStringArray,
  getDefaultMaterialForProduct,
  getDefaultSizeForProduct,
} from '@/lib/commerce';
import CustomerWishlistItem from '@/models/CustomerWishlistItem';
import {
  matchesProductRouteSegment,
  slugify,
  type ProductRecord,
} from '@/lib/productCatalog';
import { getAllProducts } from '@/lib/services/storefront';
import { getUserFromCookie } from '@/lib/userAuth';

interface IncomingWishlistItem {
  id?: unknown;
  productId?: unknown;
  name?: unknown;
  price?: unknown;
  image?: unknown;
  selectedColor?: unknown;
  selectedColorImage?: unknown;
  selectedSize?: unknown;
  selectedMaterial?: unknown;
  selectedFinish?: unknown;
  selectedAddons?: unknown;
  configurationNotes?: unknown;
}

function findMatchingProduct(products: ProductRecord[], item: IncomingWishlistItem) {
  const normalizedProductId = cleanCommerceString(item.productId, 160);
  const normalizedName = slugify(cleanCommerceString(item.name, 160));

  return products.find(
    (product) =>
      matchesProductRouteSegment(product, normalizedProductId) ||
      (normalizedName && slugify(product.name) === normalizedName)
  );
}

function normalizeWishlistItem(item: IncomingWishlistItem, products: ProductRecord[]) {
  const product = findMatchingProduct(products, item);

  if (!product || product.active === false) {
    return null;
  }

  const selectedColor = cleanCommerceString(item.selectedColor, 80);
  const selectedColorEntry =
    product.colors.find(
      (color) => color.name.trim().toLowerCase() === selectedColor.trim().toLowerCase()
    ) || product.colors[0];
  const normalizedItem = {
    id: buildCommerceItemId(product.id, {
      selectedColor: selectedColorEntry?.name || selectedColor,
      selectedColorImage:
        selectedColorEntry?.image || cleanCommerceString(item.selectedColorImage, 300),
      selectedSize: cleanCommerceString(item.selectedSize, 80) || getDefaultSizeForProduct(product),
      selectedMaterial:
        cleanCommerceString(item.selectedMaterial, 80) || getDefaultMaterialForProduct(product),
      selectedFinish: cleanCommerceString(item.selectedFinish, 80),
      selectedAddons: cleanCommerceStringArray(item.selectedAddons, 80).slice(0, 8),
      configurationNotes: cleanCommerceString(item.configurationNotes, 240),
    }),
    productId: product.id,
    name: product.name,
    image: selectedColorEntry?.image || product.imageUrl || cleanCommerceString(item.image, 300),
    price: product.finalPrice ?? product.price,
    selectedColor: selectedColorEntry?.name || selectedColor,
    selectedColorImage:
      selectedColorEntry?.image || cleanCommerceString(item.selectedColorImage, 300),
    selectedSize: cleanCommerceString(item.selectedSize, 80) || getDefaultSizeForProduct(product),
    selectedMaterial:
      cleanCommerceString(item.selectedMaterial, 80) || getDefaultMaterialForProduct(product),
    selectedFinish: cleanCommerceString(item.selectedFinish, 80),
    selectedAddons: cleanCommerceStringArray(item.selectedAddons, 80).slice(0, 8),
    configurationNotes: cleanCommerceString(item.configurationNotes, 240),
  };

  return normalizedItem;
}

export async function GET() {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  const items = await CustomerWishlistItem.find({ userId: user.userId })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.lineId,
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      selectedColor: item.selectedColor || '',
      selectedColorImage: item.selectedColorImage || '',
      selectedSize: item.selectedSize || '',
      selectedMaterial: item.selectedMaterial || '',
      selectedFinish: item.selectedFinish || '',
      selectedAddons: Array.isArray(item.selectedAddons) ? item.selectedAddons : [],
      configurationNotes: item.configurationNotes || '',
    })),
  });
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    items?: IncomingWishlistItem[];
  };
  const items = Array.isArray(payload.items) ? payload.items : [];
  const products = await getAllProducts();
  const normalizedItems = items
    .map((item) => normalizeWishlistItem(item, products))
    .filter(
      (item): item is NonNullable<ReturnType<typeof normalizeWishlistItem>> => Boolean(item)
    );

  await dbConnect();
  await CustomerWishlistItem.deleteMany({ userId: user.userId });

  if (normalizedItems.length) {
    await CustomerWishlistItem.insertMany(
      normalizedItems.map((item) => ({
        userId: user.userId,
        lineId: item.id,
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        selectedColor: item.selectedColor,
        selectedColorImage: item.selectedColorImage,
        selectedSize: item.selectedSize,
        selectedMaterial: item.selectedMaterial,
        selectedFinish: item.selectedFinish,
        selectedAddons: item.selectedAddons,
        configurationNotes: item.configurationNotes,
      }))
    );
  }

  return NextResponse.json({ success: true, items: normalizedItems });
}

export async function DELETE() {
  const user = await getUserFromCookie();

  if (!user?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();
  await CustomerWishlistItem.deleteMany({ userId: user.userId });

  return NextResponse.json({ success: true });
}
