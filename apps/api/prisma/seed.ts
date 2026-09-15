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
