import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { categories, products, blogPosts } from '@frozen-fruit-shop/fixtures';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@frozenfruitshop.vn';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';

  console.log('Seeding admin account...');
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: 'Chủ cửa hàng',
    },
  });

  console.log('Seeding categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image,
        description: category.description,
      },
    });
  }

  console.log('Seeding products & variants...');
  for (const product of products) {
    const category = categories.find((c) => c.slug === product.categorySlug);
    if (!category) {
      throw new Error(`Fixture data error: category "${product.categorySlug}" not found for product "${product.slug}"`);
    }

    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        categoryId: category.id,
        images: product.images,
        shortDescription: product.shortDescription,
        description: product.description,
        storageTemperature: product.storageInfo.temperature,
        shelfLifeDays: product.storageInfo.shelfLifeDays,
        thawInstructions: product.storageInfo.thawInstructions,
        rating: product.rating,
        reviewCount: product.reviewCount,
        tags: product.tags,
        isWholesaleAvailable: product.isWholesaleAvailable,
        relatedProductIds: product.relatedProductIds,
        variants: {
          create: product.variants.map((variant) => ({
            id: variant.id,
            packageSize: variant.packageSize,
            price: variant.price,
            pricePerKg: variant.pricePerKg,
            stockStatus: variant.stockStatus,
            sku: variant.sku,
          })),
        },
      },
    });
  }

  console.log('Seeding blog posts...');
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        coverImage: post.coverImage,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        publishedAt: new Date(post.publishedAt),
      },
    });
  }

  console.log('Seeding sample orders (demo data for the admin dashboard)...');
  const variants = await prisma.productVariant.findMany({ include: { product: true }, orderBy: { sku: 'asc' } });
  const statuses = ['pending', 'confirmed', 'packing', 'shipping', 'delivered', 'delivered', 'delivered', 'cancelled'] as const;
  const provinces = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];
  if (variants.length > 0) {
    for (let i = 0; i < 40; i++) {
      const orderNumber = `DEMO-${String(i + 1).padStart(4, '0')}`;
      const items = [0, 1].slice(0, (i % 2) + 1).map((k) => {
        const variant = variants[(i * 3 + k * 5) % variants.length];
        return { variant, quantity: ((i + k) % 3) + 1 };
      });
      const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
      const shippingFee = 30000;
      const createdAt = new Date(Date.now() - ((i * 37) % (29 * 24)) * 3600 * 1000);
      await prisma.order.upsert({
        where: { orderNumber },
        update: {},
        create: {
          orderNumber,
          customerName: `Khách hàng ${i + 1}`,
          customerPhone: `09000000${String(i).padStart(2, '0')}`,
          customerEmail: `khach${i + 1}@example.com`,
          shippingProvince: provinces[i % provinces.length],
          shippingDistrict: 'Quận 1',
          shippingWard: 'Phường 1',
          shippingAddressLine: `${i + 1} Đường mẫu`,
          shippingMethod: 'standard',
          paymentMethod: i % 3 === 0 ? 'bank_transfer' : 'cod',
          status: statuses[i % statuses.length],
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          createdAt,
          items: {
            create: items.map(({ variant, quantity }) => ({
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              packageSize: variant.packageSize,
              unitPrice: variant.price,
              quantity,
            })),
          },
        },
      });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
