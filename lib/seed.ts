import dbConnect from './mongoose';
import Product from '../models/Product';

const initialProducts = [
  {
    category: 'sofa',
    name: 'Milano Sculpted Sofa',
    description:
      'Layered in deep olive velvet with a softly curved silhouette, this statement sofa anchors the room with gallery-grade presence and cloud-soft comfort.',
    price: 45000,
    stock: 7,
    imageUrl: '/products/sofa/main.png',
    eyebrow: 'Signature Sofa',
    modelPath: '/3D%20models/teal%20sofa%203d%20model.glb',
    images: [
      '/products/sofa/main.png',
      '/products/sofa/cover.png',
      '/products/sofa/top.png',
      '/products/sofa/left.png',
      '/products/sofa/right.png',
      '/products/sofa/sofa leg.png',
    ],
    colors: [
      { name: 'Olive Velvet', image: '/products/sofa/main.png' },
      { name: 'Bronze Leather', image: '/products/sofa/bronge leather.png' },
      { name: 'Warm Taupe', image: '/products/sofa/warm taupe.png' },
      { name: 'Deep Charcoal', image: '/products/sofa/deep charcol.png' },
    ],
    specs: {
      material: 'Premium velvet upholstery',
      foam: 'High-density foam core',
      dimensions: '300 × 90 × 80 cm',
      weight: '80 kg',
      warranty: '5 years',
    },
  },
  {
    category: 'chair',
    name: 'Verona Accent Chair',
    description:
      'A sculpted lounge chair with curved arms, rich textured upholstery, and a compact footprint that adds depth to reading corners and formal seating areas.',
    price: 18500,
    stock: 12,
    imageUrl: '/products/chairs/main.png',
    eyebrow: 'Accent Seating',
    modelPath: '/3D%20models/teal+velvet+armchair+3d+model.glb',
    images: [
      '/products/chairs/main.png',
      '/products/chairs/cover.png',
      '/products/chairs/top.png',
      '/products/chairs/left.png',
      '/products/chairs/right.png',
      '/products/chairs/legs.png',
    ],
    colors: [
      { name: 'Cognac Leather', image: '/products/chairs/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/chairs/Forest Green.png' },
      { name: 'Sunset Terracotta', image: '/products/chairs/Sunset Terracotta.png' },
      { name: 'Midnight Navy', image: '/products/chairs/midnight navy.png' },
    ],
    specs: {
      material: 'Textured fabric',
      foam: 'Multi-layer foam',
      dimensions: '80 × 80 × 85 cm',
      weight: '25 kg',
      warranty: '3 years',
    },
  },
  {
    category: 'recliner',
    name: 'Aurelian Leather Recliner',
    description:
      'Cut in rich saddle leather with tailored stitching and a quietly engineered recline, it brings lounge-level comfort to a polished living space.',
    price: 32000,
    stock: 4,
    imageUrl: '/products/recliners/main.png',
    eyebrow: 'Private Lounge',
    modelPath: '/3D%20models/recliner+chair+3d+model.glb',
    images: [
      '/products/recliners/main.png',
      '/products/recliners/cover.png',
      '/products/recliners/top.png',
      '/products/recliners/left.png',
      '/products/recliners/right.png',
      '/products/recliners/legs.png',
    ],
    colors: [
      { name: 'Cognac Leather', image: '/products/recliners/Cognac Leather.png' },
      { name: 'Forest Green', image: '/products/recliners/Forest Green.png' },
      { name: 'Midnight Navy', image: '/products/recliners/Midnight Navy.png' },
      { name: 'Sunset Terracotta', image: '/products/recliners/Sunset Terracotta.png' },
    ],
    specs: {
      material: 'Full-grain leather',
      foam: 'Ergonomic recliner mechanism',
      dimensions: '95 × 95 × 105 cm',
      weight: '45 kg',
      warranty: '5 years',
    },
  },
  {
    category: 'pouffe',
    name: 'Atelier Accent Pouffe',
    description:
      'A compact accent piece with artisanal texture, warm bronze undertones, and flexible styling that works beside a sofa, bed, or reading chair.',
    price: 4500,
    stock: 18,
    imageUrl: '/products/pouffes/main.png',
    eyebrow: 'Finishing Touch',
    modelPath: '/3D%20models/teal+pouffies+3d+model.glb',
    images: [
      '/products/pouffes/main.png',
      '/products/pouffes/cover.png',
      '/products/pouffes/top.png',
      '/products/pouffes/left.png',
      '/products/pouffes/right.png',
      '/products/pouffes/closeup.png',
    ],
    colors: [
      { name: 'Bronze Texture', image: '/products/pouffes/Cognac Leather.png' },
      { name: 'Warm Sand', image: '/products/pouffes/Midnight Navy.png' },
      { name: 'Clay Terracotta', image: '/products/pouffes/Sunset Terracota.png' },
      { name: 'Forest Green', image: '/products/pouffes/Forest Green.png' },
    ],
    specs: {
      material: 'Artisanal woven fabric',
      foam: 'Firm support filling',
      dimensions: '50 × 50 × 40 cm',
      weight: '8 kg',
      warranty: '2 years',
    },
  },
];

export async function seedProducts() {
  await dbConnect();
  const results: string[] = [];

  for (const productData of initialProducts) {
    const existing = await Product.findOne({ name: productData.name });
    if (!existing) {
      await Product.create(productData);
      results.push(`Created: ${productData.name}`);
    } else {
      results.push(`Skipped: ${productData.name} (already exists)`);
    }
  }

  return results;
}

// CLI entry point: npx tsx lib/seed.ts
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedProducts()
    .then(results => {
      results.forEach(r => console.log(r));
      console.log('Seed complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
