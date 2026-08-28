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
    },
  });

  const men = await prisma.category.upsert({
    where: { slug: 'men' },
    update: {},
    create: {
      name: 'Men',
      slug: 'men',
      description: "Men's clothing and apparel",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Bags, shoes, and other accessories',
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
    },
  });

  console.log('Seeded 7 categories (3 parent, 4 child)');
  return { womensClothing, men, accessories, dresses, jackets, bags, shoes };
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
  ];

  let count = 0;
  for (const product of products) {
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

    count++;
  }

  console.log(`Seeded ${count} products`);
}

async function main() {
  await seedUsers();
  const categories = await seedCategories();
  await seedProducts(categories);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
