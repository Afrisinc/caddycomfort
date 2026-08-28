import { PrismaClient, UserRole, InventoryLogType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Password123!';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function seedUsers() {
  const password = await hashPassword(SEED_PASSWORD);

  const customers = [
    {
      email: 'sarah.j@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+250 788 123 456',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'michael.b@example.com',
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '+250 788 234 567',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'emily.d@example.com',
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '+250 788 345 678',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'david.w@example.com',
      firstName: 'David',
      lastName: 'Wilson',
      phone: '+250 788 456 789',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'jessica.m@example.com',
      firstName: 'Jessica',
      lastName: 'Martinez',
      phone: '+250 788 567 890',
      isVerified: false,
      isActive: true,
    },
    {
      email: 'suspended.user@example.com',
      firstName: 'Alex',
      lastName: 'Turner',
      phone: '+250 788 678 901',
      isVerified: true,
      isActive: false,
    },
  ];

  const created: { id: string; email: string }[] = [];

  for (const customer of customers) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        email: customer.email,
        password,
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        role: UserRole.CUSTOMER,
        isVerified: customer.isVerified,
        isActive: customer.isActive,
      },
    });
    created.push({ id: user.id, email: user.email });
  }

  console.log(`Seeded ${created.length} customer users (password: "${SEED_PASSWORD}")`);
  return created;
}

async function seedCategories() {
  const womensClothing = await prisma.category.upsert({
    where: { slug: 'womans-cloth' },
    update: {},
    create: {
      name: "Women's Clothing",
      slug: 'womans-cloth',
      description: "Women's clothing and apparel",
      image: '/new-images/dress/dress-1.jpg',
    },
  });

  const men = await prisma.category.upsert({
    where: { slug: 'men' },
    update: {},
    create: {
      name: 'Men',
      slug: 'men',
      description: "Men's clothing and apparel",
      image: '/new-images/Shoes/shoe-1.jpg',
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Bags, shoes, and other accessories',
      image: '/new-images/bag/bag-1.jpg',
    },
  });

  const dresses = await prisma.category.upsert({
    where: { slug: 'dresses' },
    update: {},
    create: {
      name: 'Dresses',
      slug: 'dresses',
      description: 'Dresses for every occasion',
      parentId: womensClothing.id,
      image: '/new-images/dress/dress-2.jpg',
    },
  });

  const jackets = await prisma.category.upsert({
    where: { slug: 'jackets' },
    update: {},
    create: {
      name: 'Jackets',
      slug: 'jackets',
      description: "Men's jackets and outerwear",
      parentId: men.id,
      image: '/new-images/Shoes/shoe-2.jpg',
    },
  });

  const bags = await prisma.category.upsert({
    where: { slug: 'bags' },
    update: {},
    create: {
      name: 'Bags',
      slug: 'bags',
      description: 'Handbags and totes',
      parentId: accessories.id,
      image: '/new-images/bag/bag-5.jpg',
    },
  });

  const shoes = await prisma.category.upsert({
    where: { slug: 'shoes' },
    update: {},
    create: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for every style',
      parentId: accessories.id,
      image: '/new-images/Shoes/shoe-18.jpg',
    },
  });

  const wigs = await prisma.category.upsert({
    where: { slug: 'wigs' },
    update: {},
    create: {
      name: 'Wigs',
      slug: 'wigs',
      description: 'Human hair and synthetic wigs',
      image: '/new-images/wigs/wig-2.jpg',
    },
  });

  const kids = await prisma.category.upsert({
    where: { slug: 'kids' },
    update: {},
    create: {
      name: 'Kids',
      slug: 'kids',
      description: "Children's clothing and accessories",
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800',
    },
  });

  console.log('Seeded 9 categories (5 parent, 4 child)');
  return { womensClothing, men, accessories, dresses, jackets, bags, shoes, wigs, kids };
}

interface SeedProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  categoryId: string;
  imageUrl: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
}

async function upsertProductWithStockLog(product: SeedProductInput) {
  const created = await prisma.product.upsert({
    where: { slug: product.slug },
    update: {},
    create: product,
  });

  // Log the seeded stock as an initial restock so "Last Restocked" and
  // stock history have real data to show.
  if (created.stockQuantity > 0) {
    const existingLog = await prisma.inventoryLog.findFirst({
      where: { productId: created.id, type: InventoryLogType.RESTOCK },
    });
    if (!existingLog) {
      await prisma.inventoryLog.create({
        data: {
          productId: created.id,
          type: InventoryLogType.RESTOCK,
          quantity: created.stockQuantity,
          reason: 'Initial stock',
        },
      });
    }
  }

  return created;
}

async function seedProducts(categories: Awaited<ReturnType<typeof seedCategories>>) {
  const products = [
    {
      name: 'Elegant Silk Dress',
      slug: 'elegant-silk-dress',
      description: 'A luxurious silk dress perfect for evening occasions, featuring a flattering silhouette and premium fabric.',
      price: 150000,
      sku: 'DRS-001',
      categoryId: categories.dresses.id,
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Burgundy'],
      tags: ['silk', 'evening', 'formal'],
      stockQuantity: 3,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Classic Leather Jacket',
      slug: 'classic-leather-jacket',
      description: 'A timeless leather jacket crafted from genuine leather, built to last and get better with age.',
      price: 450000,
      sku: 'JKT-002',
      categoryId: categories.jackets.id,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Black', 'Brown'],
      tags: ['leather', 'outerwear'],
      stockQuantity: 2,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Designer Handbag',
      slug: 'designer-handbag',
      description: 'A statement handbag with a structured shape, spacious interior, and premium hardware.',
      price: 600000,
      sku: 'BAG-003',
      categoryId: categories.bags.id,
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
      sizes: [],
      colors: ['Tan', 'Black'],
      tags: ['handbag', 'designer'],
      stockQuantity: 0,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Cashmere Sweater',
      slug: 'cashmere-sweater',
      description: 'An ultra-soft cashmere sweater that offers warmth without the bulk — a cold-weather essential.',
      price: 280000,
      sku: 'SWT-004',
      categoryId: categories.womensClothing.id,
      imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
      images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Cream', 'Grey', 'Navy'],
      tags: ['cashmere', 'knitwear', 'winter'],
      stockQuantity: 4,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Premium Sneakers',
      slug: 'premium-sneakers',
      description: 'Everyday sneakers combining comfort and style, made with breathable materials and a durable sole.',
      price: 180000,
      sku: 'SNK-005',
      categoryId: categories.shoes.id,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
      sizes: ['38', '39', '40', '41', '42', '43'],
      colors: ['White', 'Black'],
      tags: ['sneakers', 'casual'],
      stockQuantity: 25,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Summer Floral Dress',
      slug: 'summer-floral-dress',
      description: 'A breezy floral dress made from lightweight fabric, ideal for warm-weather days.',
      price: 120000,
      sku: 'DRS-006',
      categoryId: categories.dresses.id,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Floral Print'],
      tags: ['summer', 'floral', 'casual'],
      stockQuantity: 45,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Kids' Denim Jacket",
      slug: 'kids-denim-jacket',
      description: 'A durable, easy-to-layer denim jacket sized for kids, built for everyday play.',
      price: 45000,
      comparePrice: 60000,
      sku: 'KID-001',
      categoryId: categories.kids.id,
      imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800',
      images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800'],
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['Blue'],
      tags: ['kids', 'denim', 'jacket'],
      stockQuantity: 18,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Kids' Sneakers",
      slug: 'kids-sneakers',
      description: 'Lightweight, breathable sneakers with extra grip — made for running around.',
      price: 35000,
      comparePrice: 45000,
      sku: 'KID-002',
      categoryId: categories.kids.id,
      imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800',
      images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800'],
      sizes: ['28', '29', '30', '31', '32'],
      colors: ['White', 'Red'],
      tags: ['kids', 'shoes', 'sneakers'],
      stockQuantity: 22,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Kids' Cotton T-Shirt Set",
      slug: 'kids-cotton-tshirt-set',
      description: 'A 3-pack of soft, breathable cotton t-shirts in everyday colors.',
      price: 28000,
      sku: 'KID-003',
      categoryId: categories.kids.id,
      imageUrl: 'https://images.unsplash.com/photo-1519457851160-52f9a03b9dcb?w=800',
      images: ['https://images.unsplash.com/photo-1519457851160-52f9a03b9dcb?w=800'],
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
      colors: ['White', 'Blue', 'Green'],
      tags: ['kids', 'basics', 'cotton'],
      stockQuantity: 30,
      isActive: true,
      isFeatured: false,
    },
  ];

  for (const product of products) {
    await upsertProductWithStockLog(product);
  }

  console.log(`Seeded ${products.length} products`);
}

const CATALOG_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink'];
const DRESS_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const SHOE_SIZES = ['38', '39', '40', '41', '42'];

interface ShopMockItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
}

function colorsFor(index: number): string[] {
  return [CATALOG_COLORS[index % CATALOG_COLORS.length], CATALOG_COLORS[(index + 2) % CATALOG_COLORS.length]];
}

function stockFor(index: number): number {
  // Deterministic spread across out-of-stock / low / healthy stock levels.
  // Index 0 (the featured item in each group) always gets healthy stock.
  const pattern = [15, 3, 0, 22, 8, 40];
  return pattern[index % pattern.length];
}

/**
 * Seeds the full "Shop Collection" catalog that used to live as a hardcoded
 * mock array in frontend/src/app/shop/page.tsx, so the real Shop page has
 * real, browsable inventory instead of an empty grid.
 */
async function seedShopCollection(categories: Awaited<ReturnType<typeof seedCategories>>) {
  const bags: ShopMockItem[] = [
    { id: 'bag-1', title: 'Elegant Leather Handbag', price: 159000, originalPrice: 199000, image: '/new-images/bag/bag-1.jpg' },
    { id: 'bag-2', title: 'Designer Tote Bag', price: 179000, originalPrice: 229000, image: '/new-images/bag/bag-2.jpg' },
    { id: 'bag-3', title: 'Luxury Crossbody Bag', price: 139000, originalPrice: 179000, image: '/new-images/bag/bag-3.jpg' },
    { id: 'bag-4', title: 'Premium Shoulder Bag', price: 169000, originalPrice: 219000, image: '/new-images/bag/bag-4.jpg' },
    { id: 'bag-5', title: 'Stylish Clutch Bag', price: 119000, originalPrice: 149000, image: '/new-images/bag/bag-5.jpg' },
  ];

  const dresses: ShopMockItem[] = [
    { id: 'dress-1', title: 'Elegant Evening Gown', price: 249000, originalPrice: 329000, image: '/new-images/dress/dress-1.jpg' },
    { id: 'dress-2', title: 'Classic A-Line Dress', price: 189000, originalPrice: 249000, image: '/new-images/dress/dress-2.jpg' },
    { id: 'dress-3', title: 'Designer Cocktail Dress', price: 279000, originalPrice: 359000, image: '/new-images/dress/dress-3.jpg' },
    { id: 'dress-4', title: 'Elegant Maxi Dress', price: 219000, originalPrice: 289000, image: '/new-images/dress/dress-4.jpg' },
    { id: 'dress-5', title: 'Chic Midi Dress', price: 199000, originalPrice: 259000, image: '/new-images/dress/dress-5.jpg' },
    { id: 'dress-6', title: 'Luxury Ball Gown', price: 349000, originalPrice: 449000, image: '/new-images/dress/dress-6.jpg' },
    { id: 'dress-7', title: 'Stylish Casual Dress', price: 169000, originalPrice: 219000, image: '/new-images/dress/dress-7.jpg' },
    { id: 'dress-8', title: 'Formal Business Dress', price: 229000, originalPrice: 299000, image: '/new-images/dress/dress-8.jpg' },
    { id: 'dress-9', title: 'Elegant Wrap Dress', price: 209000, originalPrice: 269000, image: '/new-images/dress/dress-9.jpg' },
    { id: 'dress-10', title: 'Designer Party Dress', price: 269000, originalPrice: 349000, image: '/new-images/dress/dress-10.jpg' },
    { id: 'dress-11', title: 'Chic Bodycon Dress', price: 189000, originalPrice: 249000, image: '/new-images/dress/dress-11.jpg' },
    { id: 'dress-12', title: 'Elegant Floral Dress', price: 219000, originalPrice: 289000, image: '/new-images/dress/dress-12.jpg' },
  ];

  const shoes: ShopMockItem[] = [
    { id: 'shoe-1', title: 'Premium Leather Heels', price: 189000, originalPrice: 249000, image: '/new-images/Shoes/shoe-1.jpg' },
    { id: 'shoe-2', title: 'Designer High Heels', price: 219000, originalPrice: 289000, image: '/new-images/Shoes/shoe-2.jpg' },
    { id: 'shoe-3', title: 'Elegant Stiletto Heels', price: 199000, originalPrice: 259000, image: '/new-images/Shoes/shoe-3.jpg' },
    { id: 'shoe-4', title: 'Luxury Platform Heels', price: 229000, originalPrice: 299000, image: '/new-images/Shoes/shoe-4.jpg' },
    { id: 'shoe-5', title: 'Chic Ankle Boots', price: 249000, originalPrice: 329000, image: '/new-images/Shoes/shoe-5.jpg' },
    { id: 'shoe-6', title: 'Designer Pumps', price: 179000, originalPrice: 239000, image: '/new-images/Shoes/shoe-6.jpg' },
    { id: 'shoe-7', title: 'Elegant Wedge Heels', price: 209000, originalPrice: 269000, image: '/new-images/Shoes/shoe-7.jpg' },
    { id: 'shoe-8', title: 'Stylish Sandals', price: 159000, originalPrice: 199000, image: '/new-images/Shoes/shoe-8.jpg' },
    { id: 'shoe-9', title: 'Luxury Court Shoes', price: 189000, originalPrice: 249000, image: '/new-images/Shoes/shoe-9.jpg' },
    { id: 'shoe-10', title: 'Premium Block Heels', price: 199000, originalPrice: 259000, image: '/new-images/Shoes/shoe-10.jpg' },
    { id: 'shoe-11', title: 'Designer Mules', price: 169000, originalPrice: 219000, image: '/new-images/Shoes/shoe-11.jpg' },
    { id: 'shoe-12', title: 'Elegant Slingback Heels', price: 219000, originalPrice: 289000, image: '/new-images/Shoes/shoe-12.jpg' },
  ];

  const wigs: ShopMockItem[] = [
    { id: 'wig-1', title: 'Premium Human Hair Wig', price: 349000, originalPrice: 449000, image: '/new-images/wigs/wig-1.jpg' },
    { id: 'wig-2', title: 'Luxury Synthetic Wig', price: 229000, originalPrice: 299000, image: '/new-images/wigs/wig-2.jpg' },
  ];

  let count = 0;

  const seedGroup = async (
    items: ShopMockItem[],
    categoryId: string,
    skuPrefix: string,
    sizes: string[],
    tags: string[],
    descriptionSuffix: string
  ) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await upsertProductWithStockLog({
        name: item.title,
        slug: item.id,
        description: `${item.title} — ${descriptionSuffix}`,
        price: item.price,
        comparePrice: item.originalPrice,
        sku: `${skuPrefix}-${String(i + 1).padStart(3, '0')}`,
        categoryId,
        imageUrl: item.image,
        images: [item.image],
        sizes,
        colors: colorsFor(i),
        tags,
        stockQuantity: stockFor(i),
        isActive: true,
        isFeatured: i === 0,
      });
      count++;
    }
  };

  await seedGroup(bags, categories.bags.id, 'HBG', [], ['handbag', 'accessories'], 'a curated handbag from our accessories collection.');
  await seedGroup(dresses, categories.dresses.id, 'GWN', DRESS_SIZES, ['dress', 'women'], 'a timeless dress from our women\'s collection.');
  await seedGroup(shoes, categories.shoes.id, 'SHW', SHOE_SIZES, ['shoes', 'footwear'], 'elegant footwear from our shoe collection.');
  await seedGroup(wigs, categories.wigs.id, 'WGH', [], ['wig', 'hair'], 'a premium wig from our hair collection.');

  console.log(`Seeded ${count} shop collection products (bags, dresses, shoes, wigs)`);
}

async function seedCoupons() {
  const coupons = [
    {
      code: 'SUMMER2024',
      description: 'Summer sale discount',
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      minPurchaseAmount: 100000,
      maxDiscountAmount: 50000,
      usageLimit: 100,
      validFrom: new Date('2024-06-01'),
      validUntil: new Date('2024-08-31'),
      isActive: true,
    },
    {
      code: 'WELCOME10',
      description: 'New customer welcome discount',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      minPurchaseAmount: 50000,
      maxDiscountAmount: 20000,
      perUserLimit: 1,
      validFrom: new Date('2024-01-01'),
      isActive: true,
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on your order',
      discountType: 'FREE_SHIPPING' as const,
      discountValue: 1,
      minPurchaseAmount: 150000,
      usageLimit: 500,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2026-12-31'),
      isActive: true,
    },
    {
      code: 'FLASH50',
      description: 'Flash sale 50% off',
      discountType: 'PERCENTAGE' as const,
      discountValue: 50,
      minPurchaseAmount: 200000,
      maxDiscountAmount: 100000,
      usageLimit: 100,
      validFrom: new Date('2025-11-11'),
      validUntil: new Date('2025-11-11T23:59:59'),
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  console.log(`Seeded ${coupons.length} coupons`);
}

async function main() {
  await seedUsers();
  const categories = await seedCategories();
  await seedProducts(categories);
  await seedShopCollection(categories);
  await seedCoupons();
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
