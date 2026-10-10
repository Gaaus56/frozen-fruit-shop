// Nạp bộ dữ liệu kiểm thử (docs/06-testing/README.md §3) — CHỈ dùng cho máy dev / staging.
//   npm run db:seed:test            (chạy từ gốc repo)
//
// XOÁ TOÀN BỘ dữ liệu hiện có (kể cả tài khoản quản trị) rồi nạp lại từ đầu, nên chạy lại bao nhiêu lần
// cũng ra cùng một bộ dữ liệu. Ảnh mẫu được chép từ prisma/seed-assets/ vào UPLOAD_DIR/seed/.
// Từ chối chạy khi NODE_ENV=production hoặc DATABASE_URL không trỏ tới máy cục bộ
// (đặt SEED_ALLOW_REMOTE=1 để seed database staging).
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Prisma, PrismaClient, type OrderStatus, type PaymentMethod, type PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DEFAULT_SITE_SETTINGS } from '@frozen-fruit-shop/types';

if (existsSync('.env')) process.loadEnvFile('.env');

const prisma = new PrismaClient();
const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(HERE, 'seed-assets');
const uploadRoot = process.env.UPLOAD_DIR ?? 'uploads';
const SEED_UPLOAD_DIR = join(isAbsolute(uploadRoot) ? uploadRoot : resolve(process.cwd(), uploadRoot), 'seed');

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const now = Date.now();
const daysAgo = (days: number, hour = 10) => {
  const date = new Date(now - days * DAY);
  date.setHours(hour, 0, 0, 0);
  return date;
};

/** Sinh số ngẫu nhiên cố định theo seed — lần chạy nào cũng ra cùng dữ liệu. */
function createRandom(seed: number) {
  let state = seed;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]) => items[Math.floor(next() * items.length)],
  };
}
const random = createRandom(28);

/** Mã đơn giống API: DH + yyMMdd (giờ Việt Nam) + 4 ký tự. */
function orderNumber(createdAt: Date, suffix: string) {
  const vn = new Date(createdAt.getTime() + 7 * HOUR);
  return `DH${vn.toISOString().slice(2, 10).replace(/-/g, '')}${suffix}`;
}
const SUFFIX_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomSuffix = () => Array.from({ length: 4 }, () => random.pick([...SUFFIX_CHARS])).join('');

// ───────────────────────────── An toàn ─────────────────────────────

function assertSafeTarget() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Không chạy seed kiểm thử khi NODE_ENV=production.');
  }
  const url = process.env.DATABASE_URL ?? '';
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error('DATABASE_URL không hợp lệ hoặc chưa đặt (apps/api/.env).');
  }
  const isLocal = ['localhost', '127.0.0.1', '::1', '[::1]', 'postgres'].includes(host);
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== '1') {
    throw new Error(
      `DATABASE_URL trỏ tới "${host}" — không phải máy cục bộ. Seed sẽ XOÁ toàn bộ dữ liệu; ` +
        'nếu đây đúng là database staging, chạy lại với SEED_ALLOW_REMOTE=1.',
    );
  }
  return host;
}

// ───────────────────────────── Dữ liệu ─────────────────────────────

const PASSWORDS = { admin: 'Admin@123456', staff: 'Staff@1234' };

const CATEGORIES = [
  { key: 'C1', slug: 'xoai-dong-lanh', name: 'Xoài đông lạnh', image: 'xoai-1.png', sortOrder: 1, isActive: true,
    description: 'Xoài cát chín cây, gọt sẵn, cấp đông nhanh giữ trọn vị ngọt.' },
  { key: 'C2', slug: 'dau-dong-lanh', name: 'Dâu đông lạnh', image: 'dau-1.png', sortOrder: 2, isActive: true,
    description: 'Dâu tây Đà Lạt cấp đông, hợp làm sinh tố, mứt, bánh.' },
  { key: 'C5', slug: 'trai-cay-nhiet-doi', name: 'Trái cây nhiệt đới', image: 'thanh-long.png', sortOrder: 3, isActive: true,
    description: '' },
  { key: 'C4', slug: 'danh-muc-rong', name: 'Danh mục rỗng', image: null, sortOrder: 8, isActive: true,
    description: 'Không có sản phẩm — không hiện ở trang chủ.' },
  { key: 'C3', slug: 'danh-muc-an', name: 'Danh mục ẩn', image: null, sortOrder: 9, isActive: false,
    description: 'Danh mục đã tắt hiển thị — sản phẩm bên trong không được lộ ra web.' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
interface VariantSeed {
  packageSize: string;
  weightGrams?: number;
  price: number;
  compareAtPrice?: number;
  stockStatus?: StockStatus;
  sku?: string;
  isActive?: boolean;
}
interface ProductSeed {
  key: string;
  slug: string;
  name: string;
  category: CategoryKey;
  images?: string[];
  shortDescription?: string;
  description?: string;
  storageTemperature?: string;
  shelfLifeDays?: number;
  thawInstructions?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  variants: VariantSeed[];
}

const STORAGE = {
  storageTemperature: 'Bảo quản ở -18°C hoặc ngăn đá tủ lạnh',
  shelfLifeDays: 180,
  thawInstructions: 'Rã đông ngăn mát 6–8 tiếng, hoặc ngâm cả túi vào nước 5–15 phút. Dùng trực tiếp làm sinh tố không cần rã đông.',
};

const PRODUCTS: ProductSeed[] = [
  {
    key: 'P1', slug: 'xoai-cat-cat-mieng', name: 'Xoài cát cắt miếng', category: 'C1',
    images: ['xoai-1.png', 'xoai-2.png', 'trai-cay.png'],
    shortDescription: 'Xoài cát Hòa Lộc chín cây, gọt vỏ, cắt miếng vừa ăn.',
    description: 'Xoài cát Hòa Lộc tuyển chọn, chín cây tự nhiên.\nGọt vỏ, cắt miếng và cấp đông nhanh ngay trong ngày.\n\nPhù hợp: sinh tố, chè, bánh, ăn trực tiếp.',
    ...STORAGE, isFeatured: true, sortOrder: 1,
    variants: [
      { packageSize: '500g', weightGrams: 500, price: 85_000, compareAtPrice: 100_000, sku: 'XCM-500' },
      { packageSize: '1kg', weightGrams: 1000, price: 160_000, sku: 'XCM-1K' },
    ],
  },
  {
    key: 'P2', slug: 'dau-tay-dong-lanh', name: 'Dâu tây đông lạnh', category: 'C2', images: ['dau-1.png'],
    shortDescription: 'Dâu tây Đà Lạt nguyên trái.', ...STORAGE, sortOrder: 2,
    variants: [{ packageSize: '500g', price: 120_000, stockStatus: 'out_of_stock', sku: 'DT-500' }],
  },
  {
    key: 'P3', slug: 'sau-rieng-ri6', name: 'Sầu riêng Ri6', category: 'C1',
    shortDescription: 'Múi sầu riêng Ri6 cơm vàng, hạt lép.', ...STORAGE,
    isFeatured: true, sortOrder: 3,
    variants: [
      { packageSize: '1kg', weightGrams: 1000, price: 250_000, stockStatus: 'low_stock', sku: 'SR-1K' },
      { packageSize: '2kg', weightGrams: 2000, price: 480_000, stockStatus: 'out_of_stock', sku: 'SR-2K' },
    ],
  },
  {
    key: 'P4', slug: 'mang-cau-ngung-ban', name: 'Mãng cầu (ngừng bán)', category: 'C1', isActive: false, sortOrder: 4,
    variants: [{ packageSize: '500g', weightGrams: 500, price: 70_000 }],
  },
  {
    key: 'P5', slug: 'bo-sap', name: 'Bơ sáp', category: 'C3', sortOrder: 5,
    variants: [{ packageSize: '500g', weightGrams: 500, price: 60_000 }],
  },
  {
    key: 'P6', slug: 'thanh-long-ruot-do', name: 'Thanh long ruột đỏ cắt hạt lựu', category: 'C5', images: ['thanh-long.png'],
    shortDescription: 'Thanh long ruột đỏ Bình Thuận, cắt hạt lựu.', ...STORAGE, sortOrder: 6,
    variants: [
      { packageSize: '500g', weightGrams: 500, price: 45_000 },
      { packageSize: '1kg', weightGrams: 1000, price: 85_000 },
      { packageSize: 'Thùng 5kg', weightGrams: 5000, price: 400_000, sku: 'TL-5K' },
    ],
  },
  {
    key: 'P7', slug: 'nho-xanh-khong-hat', name: 'Nho xanh không hạt', category: 'C5', images: ['nho-1.png', 'nho-2.png'],
    shortDescription: 'Nho xanh Ninh Thuận, tách cuống.', ...STORAGE, sortOrder: 7,
    variants: [{ packageSize: '500g', weightGrams: 500, price: 95_000, compareAtPrice: 110_000 }],
  },
  {
    // Cố ý thiếu mô tả, bảo quản, khối lượng, ảnh: kiểm tra các khối tự ẩn và không hiện giá/kg.
    key: 'P8', slug: 'mit-thai-mui', name: 'Mít Thái múi', category: 'C5', sortOrder: 8,
    variants: [{ packageSize: 'Hộp 500g', price: 55_000 }],
  },
  {
    // Có một quy cách đã tắt bán: web chỉ được hiện 250g.
    key: 'P9', slug: 'dau-tay-cat-lat', name: 'Dâu tây cắt lát', category: 'C2', images: ['dau-2.png'],
    shortDescription: 'Dâu tây cắt lát sẵn, tiện làm topping.', ...STORAGE, sortOrder: 9,
    variants: [
      { packageSize: '250g', weightGrams: 250, price: 65_000 },
      { packageSize: '500g', weightGrams: 500, price: 120_000, isActive: false },
    ],
  },
];

const CUSTOMERS = [
  ['Nguyễn Thị Lan', '0905111222', 'K12/3 Lê Duẩn, Hải Châu, Đà Nẵng'],
  ['Trần Văn Minh', '0935222333', '45 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng'],
  ['Lê Hoàng Yến', '0914333444', '78 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng'],
  ['Phạm Quốc Huy', '0987444555', '12 Ngô Quyền, Sơn Trà, Đà Nẵng'],
  ['Võ Thị Mai', '0372555666', '210 Hùng Vương, TP. Tam Kỳ, Quảng Nam'],
  ['Đặng Minh Tuấn', '0868666777', '5 Trần Hưng Đạo, TP. Huế'],
  ['Cafe Mộc', '0236377888', '33 Phan Châu Trinh, Hải Châu, Đà Nẵng'],
] as const;

// ───────────────────────────── Nạp dữ liệu ─────────────────────────────

async function wipe() {
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.orderStatusLog.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.inquiry.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.post.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.policy.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function copyAssets() {
  await rm(SEED_UPLOAD_DIR, { recursive: true, force: true });
  await mkdir(SEED_UPLOAD_DIR, { recursive: true });
  for (const file of await readdir(ASSETS_DIR)) await copyFile(join(ASSETS_DIR, file), join(SEED_UPLOAD_DIR, file));
}
const img = (file: string) => `/uploads/seed/${file}`;

async function seedUsers() {
  const [adminHash, staffHash] = await Promise.all([
    bcrypt.hash(PASSWORDS.admin, 12),
    bcrypt.hash(PASSWORDS.staff, 12),
  ]);
  const admin = await prisma.user.create({
    data: { email: 'admin@test.vn', name: 'Chủ cửa hàng (test)', role: 'ADMIN', passwordHash: adminHash, lastLoginAt: daysAgo(0, 8) },
  });
  const staff1 = await prisma.user.create({
    data: { email: 'staff1@test.vn', name: 'Nhân viên Hoa', role: 'STAFF', passwordHash: staffHash, lastLoginAt: daysAgo(1, 9) },
  });
  await prisma.user.create({ data: { email: 'staff2@test.vn', name: 'Nhân viên Nam', role: 'STAFF', passwordHash: staffHash } });
  await prisma.user.create({
    data: { email: 'staff3@test.vn', name: 'Nhân viên đã nghỉ', role: 'STAFF', passwordHash: staffHash, isActive: false },
  });
  return { admin, staff1 };
}

async function seedCatalog() {
  const categoryIds = new Map<CategoryKey, string>();
  for (const { key, image, ...category } of CATEGORIES) {
    const row = await prisma.category.create({ data: { ...category, image: image ? img(image) : null } });
    categoryIds.set(key, row.id);
  }

  const variants = new Map<string, { id: string; productId: string; productName: string; packageSize: string; price: number; sellable: boolean }>();
  for (const [index, product] of PRODUCTS.entries()) {
    const { key, category, images = [], variants: variantSeeds, ...data } = product;
    const row = await prisma.product.create({
      data: {
        ...data,
        categoryId: categoryIds.get(category)!,
        // createdAt tăng dần theo thứ tự khai báo để sắp xếp "Mới nhất" có kết quả xác định.
        createdAt: daysAgo(60 - index * 5),
        images: { create: images.map((file, sortOrder) => ({ url: img(file), alt: product.name, sortOrder })) },
        variants: {
          create: variantSeeds.map((variant, sortOrder) => ({
            packageSize: variant.packageSize,
            weightGrams: variant.weightGrams ?? null,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice ?? null,
            stockStatus: variant.stockStatus ?? 'in_stock',
            sku: variant.sku ?? null,
            isActive: variant.isActive ?? true,
            sortOrder,
          })),
        },
      },
      include: { variants: true },
    });
    for (const variant of row.variants) {
      variants.set(`${key}:${variant.packageSize}`, {
        id: variant.id,
        productId: row.id,
        productName: row.name,
        packageSize: variant.packageSize,
        price: variant.price,
        sellable: row.isActive && variant.isActive && category !== 'C3',
      });
    }
  }
  return variants;
}

type VariantMap = Awaited<ReturnType<typeof seedCatalog>>;
interface OrderSeed {
  suffix: string;
  createdAt: Date;
  customer: readonly [string, string, string];
  email?: string;
  note?: string;
  items: { key: string; quantity: number }[];
  /** Dòng hàng của sản phẩm đã bị xoá: chỉ còn bản chụp. */
  deletedItems?: { productName: string; packageSize: string; unitPrice: number; quantity: number }[];
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  shippingFee?: number;
  discount?: number;
  internalNote?: string;
}

const FLOW: OrderStatus[] = ['pending', 'confirmed', 'packing', 'shipping', 'delivered'];

async function createOrder(seed: OrderSeed, variants: VariantMap, users: { admin: { id: string }; staff1: { id: string } }) {
  const lines: Prisma.OrderItemCreateManyOrderInput[] = seed.items.map(({ key, quantity }) => {
    const variant = variants.get(key);
    if (!variant) throw new Error(`Không có quy cách ${key}`);
    return {
      productId: variant.productId,
      variantId: variant.id,
      productName: variant.productName,
      packageSize: variant.packageSize,
      unitPrice: variant.price,
      quantity,
      lineTotal: variant.price * quantity,
    };
  });
  for (const item of seed.deletedItems ?? []) {
    lines.push({ productId: null, variantId: null, ...item, lineTotal: item.unitPrice * item.quantity });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shippingFee = seed.status === 'pending' ? 0 : (seed.shippingFee ?? 0);
  const discount = seed.discount ?? 0;

  // Lịch sử: đi lần lượt theo luồng tới trạng thái hiện tại; đơn huỷ thì huỷ sau khi xác nhận.
  const path: OrderStatus[] =
    seed.status === 'cancelled' ? ['pending', 'confirmed', 'cancelled'] : FLOW.slice(0, FLOW.indexOf(seed.status) + 1);
  const logs = path.map((toStatus, index) => ({
    fromStatus: index === 0 ? null : path[index - 1],
    toStatus,
    note: index === 0 ? 'Khách đặt hàng qua website' : toStatus === 'cancelled' ? 'Khách gọi huỷ đơn' : '',
    changedById: index === 0 ? null : index === 1 ? users.admin.id : users.staff1.id,
    createdAt: new Date(seed.createdAt.getTime() + index * 3 * HOUR),
  }));

  const [name, phone, address] = seed.customer;
  return prisma.order.create({
    data: {
      orderNumber: orderNumber(seed.createdAt, seed.suffix),
      customerName: name,
      customerPhone: phone,
      customerEmail: seed.email ?? null,
      shippingAddress: address,
      customerNote: seed.note ?? '',
      paymentMethod: seed.paymentMethod ?? 'cod',
      paymentStatus: seed.paymentStatus ?? (seed.status === 'delivered' ? 'paid' : 'unpaid'),
      status: seed.status,
      subtotal,
      shippingFee,
      discount,
      total: subtotal + shippingFee - discount,
      internalNote: seed.internalNote ?? '',
      createdAt: seed.createdAt,
      updatedAt: logs[logs.length - 1].createdAt,
      items: { createMany: { data: lines } },
      logs: { create: logs },
    },
  });
}

async function seedOrders(variants: VariantMap, users: { admin: { id: string }; staff1: { id: string } }) {
  const tester = ['Khách Test', '0905123456', '12 Lê Duẩn, Hải Châu, Đà Nẵng'] as const;

  // Đơn cố định cho kịch bản test — mã đơn in ra cuối lần chạy.
  const fixed: OrderSeed[] = [
    { suffix: 'TSTA', createdAt: daysAgo(0, 9), customer: tester, status: 'pending', email: 'khach@test.vn',
      note: 'Giao giờ hành chính, gọi trước 15 phút.', items: [{ key: 'P1:500g', quantity: 2 }, { key: 'P3:1kg', quantity: 1 }] },
    { suffix: 'TSTB', createdAt: daysAgo(1), customer: tester, status: 'confirmed', paymentMethod: 'bank_transfer',
      shippingFee: 30_000, items: [{ key: 'P6:1kg', quantity: 2 }] },
    { suffix: 'TSTC', createdAt: daysAgo(2), customer: tester, status: 'packing', shippingFee: 25_000,
      items: [{ key: 'P7:500g', quantity: 1 }, { key: 'P9:250g', quantity: 2 }] },
    { suffix: 'TSTD', createdAt: daysAgo(3), customer: tester, status: 'shipping', shippingFee: 25_000,
      internalNote: 'Mã vận đơn GHN: GHN123456', items: [{ key: 'P1:1kg', quantity: 1 }] },
    { suffix: 'TSTE', createdAt: daysAgo(5), customer: tester, status: 'delivered', paymentMethod: 'bank_transfer',
      shippingFee: 25_000, discount: 10_000, items: [{ key: 'P1:500g', quantity: 2 }, { key: 'P6:500g', quantity: 2 }] },
    { suffix: 'TSTF', createdAt: daysAgo(6), customer: tester, status: 'cancelled', shippingFee: 30_000,
      items: [{ key: 'P8:Hộp 500g', quantity: 3 }] },
    { suffix: 'TSTG', createdAt: daysAgo(20), customer: tester, status: 'delivered', shippingFee: 20_000,
      items: [{ key: 'P7:500g', quantity: 1 }],
      deletedItems: [{ productName: 'Mãng cầu xiêm (đã xoá khỏi hệ thống)', packageSize: '1kg', unitPrice: 90_000, quantity: 1 }] },
    { suffix: 'TSTH', createdAt: daysAgo(0, 11), status: 'pending',
      customer: ['<img src=x onerror=alert(1)>', '0905123456', '<script>alert("địa chỉ")</script> 99 Hàm Nghi, Đà Nẵng'],
      note: '<b>Ghi chú có HTML</b>', items: [{ key: 'P6:500g', quantity: 1 }] },
  ];

  const created = [];
  for (const order of fixed) created.push(await createOrder(order, variants, users));

  // Lịch sử bán hàng ~13 tháng cho trang Tổng quan, biểu đồ và phân trang (> 20 đơn).
  const sellable = [...variants.entries()].filter(([, variant]) => variant.sellable).map(([key]) => key);
  for (let i = 0; i < 60; i += 1) {
    const age = random.int(4, 400);
    const items = Array.from({ length: random.int(1, 3) }, () => ({ key: random.pick(sellable), quantity: random.int(1, 4) }));
    const merged = [...new Map(items.map((item) => [item.key, item])).values()];
    const roll = random.next();
    await createOrder(
      {
        suffix: randomSuffix(),
        createdAt: daysAgo(age, random.int(7, 22)),
        customer: random.pick(CUSTOMERS),
        status: roll < 0.12 ? 'cancelled' : 'delivered',
        paymentMethod: random.next() < 0.35 ? 'bank_transfer' : 'cod',
        shippingFee: random.pick([15_000, 20_000, 25_000, 30_000, 40_000]),
        discount: random.next() < 0.15 ? 10_000 : 0,
        items: merged,
      },
      variants,
      users,
    );
  }
  return created;
}

async function seedInquiries() {
  const rows: Prisma.InquiryCreateManyInput[] = [
    { type: 'contact', name: 'Nguyễn Thị Lan', phone: '0905111222', message: 'Shop có giao ra Hội An không ạ?', status: 'new', createdAt: daysAgo(0, 8) },
    { type: 'contact', name: 'Trần Minh', email: 'minh@test.vn', message: 'Cho mình hỏi xoài 1kg còn hàng không?\nCảm ơn shop.', status: 'new', createdAt: daysAgo(1) },
    { type: 'wholesale', name: 'Lê Văn Bảo', company: 'Cafe Mộc', phone: '0236377888', quantity: 'Xoài 30kg/tháng, dâu 20kg/tháng',
      message: 'Cần báo giá giao định kỳ thứ 2 hằng tuần.', status: 'new', createdAt: daysAgo(1, 15) },
    { type: 'wholesale', name: 'Phạm Thu', company: 'Trà sữa Mây', phone: '0914333444', quantity: 'Thanh long 50kg/tháng', status: 'in_progress', createdAt: daysAgo(4) },
    { type: 'contact', name: 'Võ Mai', phone: '0372555666', message: 'Đơn của mình bị rã đông một phần.', status: 'in_progress', createdAt: daysAgo(6) },
    { type: 'contact', name: 'Khách cũ', email: 'khachcu@test.vn', message: 'Cảm ơn shop, dâu rất ngon!', status: 'done', createdAt: daysAgo(15) },
    { type: 'wholesale', name: 'Đặng Tuấn', company: 'Nhà hàng Biển Xanh', phone: '0868666777', quantity: 'Sầu riêng 10kg', status: 'done', createdAt: daysAgo(30) },
    { type: 'contact', name: '<script>alert(1)</script>', phone: '0905123456', message: '<img src=x onerror=alert(2)> nội dung có HTML', status: 'new', createdAt: daysAgo(0, 12) },
  ];
  await prisma.inquiry.createMany({ data: rows });
}

async function seedContent() {
  await prisma.siteSetting.create({
    data: {
      id: 1,
      ...DEFAULT_SITE_SETTINGS,
      productAssurances: undefined, // để NULL → API dùng bộ thẻ cam kết mặc định
      marqueeEnabled: true,
      marqueeText: 'Miễn phí giao hàng nội thành Đà Nẵng cho đơn từ 300.000đ — Hotline 0396 799 579',
      bankTransferInfo: 'Ngân hàng: Vietcombank\nSố tài khoản: 0123456789 (TÀI KHOẢN TEST)\nChủ tài khoản: NGUYEN VAN A\nNội dung: <mã đơn hàng>',
    },
  });

  await prisma.banner.createMany({
    data: [
      { title: 'Trái cây đông lạnh chuẩn VietGAP', description: 'Cấp đông nhanh, giữ trọn vị ngọt tự nhiên.', image: img('banner-1.jpg'),
        linkUrl: '/products', ctaLabel: 'Mua ngay', sortOrder: 1 },
      { image: img('banner-2.jpg'), sortOrder: 2 },
      { title: 'Banner đã tắt', image: img('banner-3.jpg'), linkUrl: '/news', ctaLabel: 'Xem', sortOrder: 3, isActive: false },
      { placement: 'products', title: 'Trái cây đông lạnh Đà Nẵng 28', image: img('banner-san-pham.jpg'),
        description: 'Cấp đông nhanh sau thu hoạch, đóng gói hút chân không — chọn loại và quy cách bạn cần.', sortOrder: 1 },
      { placement: 'news', image: img('banner-3.jpg'), sortOrder: 1 },
    ],
  });

  const content = (topic: string) =>
    `${topic} là câu hỏi nhiều khách hàng gửi tới cửa hàng.\n\n1. Chuẩn bị\nLấy túi trái cây ra khỏi ngăn đá, giữ nguyên túi hút chân không.\n\n2. Thực hiện\nRã đông ngăn mát 6–8 tiếng, hoặc ngâm cả túi vào nước 5–15 phút.\n\n3. Lưu ý\nKhông cấp đông lại trái cây đã rã đông hoàn toàn.`;
  await prisma.post.createMany({
    data: [
      { slug: 'cach-ra-dong-trai-cay', title: 'Cách rã đông trái cây đúng cách', excerpt: 'Ba cách rã đông giữ trọn hương vị.',
        content: content('Rã đông thế nào cho đúng'), coverImage: img('bai-viet-1.jpg'), publishedAt: daysAgo(1) },
      { slug: 'sinh-to-xoai-dau', title: 'Sinh tố xoài dâu 5 phút', excerpt: 'Công thức sinh tố mát lạnh cho ngày hè.',
        content: content('Làm sinh tố từ trái cây đông lạnh'), coverImage: img('bai-viet-2.jpg'), publishedAt: daysAgo(10) },
      { slug: 'trai-cay-dong-lanh-co-mat-chat', title: 'Trái cây đông lạnh có mất chất?', excerpt: 'So sánh trái cây tươi và đông lạnh.',
        content: content('Giá trị dinh dưỡng'), publishedAt: daysAgo(30) },
      { slug: 'bai-hen-gio', title: 'Bài viết hẹn giờ (ngày mai)', excerpt: 'Chưa được hiện trên web.', content: content('Bài hẹn giờ'),
        publishedAt: new Date(now + DAY) },
      { slug: 'tuyen-nhan-vien-ban-hang', type: 'recruitment', title: 'Tuyển 2 nhân viên bán hàng & đóng gói',
        excerpt: 'Làm việc tại cửa hàng 49 Đặng Tất, ca sáng hoặc ca chiều, lương 6–8 triệu.',
        content: `Mô tả công việc
• Tư vấn khách tại cửa hàng và qua Zalo.
• Đóng gói đơn hàng giữ lạnh (thùng xốp + đá gel).

Yêu cầu
• Trung thực, cẩn thận, ưu tiên ở Liên Chiểu.

Quyền lợi
• Lương 6–8 triệu + thưởng theo doanh số, nghỉ 4 ngày/tháng.`,
        publishedAt: daysAgo(3) },
      { slug: 'bai-nhap', title: 'Bài viết nháp', excerpt: 'Đã tắt hiển thị.', content: content('Bài nháp'), isPublished: false, publishedAt: daysAgo(2) },
    ],
  });

  const n1 = await prisma.post.findUniqueOrThrow({ where: { slug: 'cach-ra-dong-trai-cay' } });
  await prisma.comment.createMany({
    data: [
      { postId: n1.id, name: 'Chị Lan', email: 'lan@test.vn', content: 'Làm theo cách ngăn mát thấy ngon hơn hẳn, cảm ơn shop!', status: 'approved', createdAt: daysAgo(0, 9) },
      { postId: n1.id, name: 'Anh Minh', email: 'minh@test.vn', content: 'Rã đông bằng lò vi sóng được không shop?', status: 'approved',
        reply: 'Được bạn nhé, dùng chế độ rã đông 2–3 phút và đảo đều.', repliedAt: daysAgo(0, 11), createdAt: daysAgo(0, 10) },
      { postId: n1.id, name: 'Khách mới', email: 'moi@test.vn', content: 'Bình luận đang chờ duyệt (chưa hiện trên web).', createdAt: daysAgo(0, 12) },
      { postId: n1.id, name: 'Spam', email: 'spam@test.vn', content: 'Bình luận đã bị ẩn.', status: 'hidden', createdAt: daysAgo(1) },
    ],
  });

  await prisma.policy.createMany({
    data: [
      { slug: 'chinh-sach-doi-tra', title: 'Chính sách bảo hành & đổi trả', sortOrder: 1, content: await policyTemplate() },
      { slug: 'chinh-sach-giao-hang', title: 'Chính sách giao hàng', sortOrder: 2,
        content: 'Nội thành Đà Nẵng: giao trong ngày, phí 15.000–30.000đ.\nNgoại tỉnh: đóng thùng xốp + đá gel, phí báo khi xác nhận đơn.' },
      { slug: 'chinh-sach-bao-mat', title: 'Chính sách bảo mật', sortOrder: 3,
        content: 'Thông tin khách hàng chỉ dùng để giao hàng và liên hệ về đơn, không chia sẻ cho bên thứ ba.' },
      { slug: 'chinh-sach-noi-bo', title: 'Chính sách nội bộ', sortOrder: 9, isActive: false, content: 'Trang đã tắt — không được hiện trên web.' },
    ],
  });
}

/** Lấy đúng nội dung mẫu "đổi trả" của trang quản trị để dữ liệu test khớp với giao diện. */
async function policyTemplate(): Promise<string> {
  const path = resolve(HERE, '../../admin/src/app/(dashboard)/policies/templates.ts');
  try {
    const { POLICY_TEMPLATES } = (await import(pathToFileURL(path).href)) as { POLICY_TEMPLATES: readonly { key: string; content: string }[] };
    return POLICY_TEMPLATES.find((item) => item.key === 'doi-tra')?.content ?? '';
  } catch {
    return 'Xem nội dung mẫu ở trang quản trị → Chính sách.';
  }
}

/** Báo web xoá cache để thấy dữ liệu mới ngay (bỏ qua nếu web chưa chạy). */
async function revalidateWeb() {
  const url = process.env.WEB_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return 'bỏ qua (chưa cấu hình WEB_REVALIDATE_URL / REVALIDATE_SECRET)';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags: ['catalog', 'content', 'settings'] }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? 'đã xoá cache web' : `web trả ${res.status}`;
  } catch {
    return 'web chưa chạy — trang sẽ tự làm mới sau ≤ 5 phút';
  }
}

async function main() {
  const host = assertSafeTarget();
  console.log(`Seed dữ liệu kiểm thử vào database @ ${host} — XOÁ toàn bộ dữ liệu cũ...`);

  await wipe();
  await copyAssets();
  const users = await seedUsers();
  const variants = await seedCatalog();
  const fixedOrders = await seedOrders(variants, users);
  await seedInquiries();
  await seedContent();
  const cache = await revalidateWeb();

  const counts = await Promise.all([
    prisma.category.count(), prisma.product.count(), prisma.order.count(), prisma.inquiry.count(),
    prisma.post.count(), prisma.banner.count(), prisma.policy.count(),
  ]);
  console.log(`
✔ Xong. ${counts[0]} danh mục · ${counts[1]} sản phẩm · ${counts[2]} đơn · ${counts[3]} liên hệ · ${counts[4]} bài viết · ${counts[5]} banner · ${counts[6]} chính sách
  Ảnh mẫu: ${SEED_UPLOAD_DIR}
  Cache web: ${cache}

Tài khoản (trang quản trị http://localhost:3002):
  ADMIN   admin@test.vn    ${PASSWORDS.admin}
  STAFF1  staff1@test.vn   ${PASSWORDS.staff}
  STAFF2  staff2@test.vn   ${PASSWORDS.staff}
  STAFF3  staff3@test.vn   ${PASSWORDS.staff}   (đã khoá)

Đơn cố định để tra cứu (SĐT 0905123456):
${fixedOrders.map((order) => `  ${order.orderNumber}  ${order.status.padEnd(9)}  ${order.total.toLocaleString('vi-VN')}đ`).join('\n')}

Lưu ý: rate limit nằm trong bộ nhớ API — khởi động lại API nếu cần xoá bộ đếm.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
