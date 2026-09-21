# Giải thích cây thư mục dự án

Tài liệu này giải thích vì sao repo được tổ chức theo cấu trúc hiện tại, mỗi thư mục dùng để làm gì, và quy tắc nên theo khi thêm code mới.

## 1. Tổng quan

```
frozen-fruit-shop/
├── apps/
│   ├── web/          # Frontend — Next.js storefront (khách hàng)
│   ├── admin/          # Frontend — Next.js trang quản trị (chủ cửa hàng)
│   └── api/             # Backend — NestJS + Prisma (REST API dùng chung cho web và admin)
├── packages/
│   ├── types/          # Type TypeScript dùng chung giữa web và api
│   └── fixtures/       # Dữ liệu mẫu dùng chung (nội dung catalog + seed data)
├── docs/
│   ├── plan/           # Tài liệu kế hoạch (phạm vi, tech stack, roadmap...)
│   └── guide/           # Tài liệu hướng dẫn kỹ thuật (file này)
├── docker-compose.yml   # PostgreSQL cho môi trường dev cục bộ
├── package.json         # Cấu hình npm workspaces ở gốc
└── package-lock.json     # Lockfile duy nhất cho toàn bộ monorepo
```

Đây là **npm workspaces monorepo**: một lệnh `npm install` ở gốc cài đặt dependency cho tất cả app/package bên trong, và các package có thể `import` lẫn nhau như package npm bình thường (ví dụ `apps/web` import từ `@frozen-fruit-shop/types`).

## 2. Vì sao tách `apps/` và `packages/`?

Đây là quy ước phổ biến của monorepo (Turborepo, Nx, và nhiều dự án lớn dùng chung mẫu này):

- **`apps/`** chứa các ứng dụng **chạy được độc lập**, có thể build/deploy/khởi động riêng biệt. Mỗi thư mục con là một "sản phẩm" hoàn chỉnh (một web server, một API server...). Dự án có 3 app: `web` (khách hàng xem), `admin` (chủ shop quản lý — có đăng nhập, không công khai) và `api` (phục vụ dữ liệu cho cả hai).
- **`packages/`** chứa **thư viện nội bộ dùng chung**, không tự chạy được — chỉ được `apps/*` import vào. Tách ra để tránh copy-paste code/type giữa các app, và đảm bảo dữ liệu không bị lệch nhau.

Lý do cụ thể trong dự án này: `apps/web` và `apps/api` đều cần biết "một sản phẩm trông như thế nào" (field gì, kiểu dữ liệu gì) và đều cần cùng một bộ dữ liệu mẫu ban đầu (danh mục, sản phẩm, bài viết). Nếu định nghĩa hai lần ở hai nơi, chỉ cần sửa một chỗ mà quên chỗ kia là dữ liệu hiển thị trên web sẽ không khớp với dữ liệu trong database — đây chính là vấn đề `packages/types` và `packages/fixtures` giải quyết.

## 3. `apps/web` — Frontend (Next.js)

```
apps/web/
├── src/
│   ├── app/            # Route theo App Router — mỗi thư mục = một trang
│   ├── components/     # Component React, chia theo domain
│   │   ├── layout/       # Header, Footer
│   │   ├── ui/            # Component dùng chung, không gắn nghiệp vụ (Button, Container...)
│   │   ├── home/          # Component chỉ dùng ở trang chủ
│   │   ├── product/       # Component liên quan sản phẩm
│   │   └── contact/        # Form liên hệ, form đặt hàng sỉ
│   ├── data/             # Dữ liệu/nội dung CHỈ dùng ở frontend (vd. policies.ts)
│   ├── lib/               # Hàm tiện ích, context (cart-context, format...)
│   └── types/              # Type CHỈ dùng ở frontend (vd. CartItem) + re-export type dùng chung
├── public/               # Ảnh tĩnh, favicon
├── next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
└── package.json
```

**Quy tắc đặt component:** nếu component chỉ phục vụ một trang/tính năng cụ thể, đặt trong thư mục con theo tên tính năng đó (`home/`, `product/`...). Nếu dùng lại ở nhiều nơi và không gắn nghiệp vụ cụ thể (nút bấm, khung container...), đặt trong `ui/`.

**`src/data/` vs `packages/fixtures`:** `src/data/policies.ts` (nội dung trang chính sách) chỉ có ý nghĩa với frontend, backend không cần biết — nên nó ở lại trong `apps/web`, không chuyển ra `packages/fixtures`. Ngược lại, sản phẩm/danh mục/bài viết cần cho cả hai nên nằm ở `packages/fixtures`.

## 4. `apps/admin` — Trang quản trị (Next.js)

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── login/                 # Trang đăng nhập (không có sidebar)
│   │   └── (dashboard)/           # Route group — mọi trang trong này có sidebar + yêu cầu đăng nhập
│   │       ├── products/          # Danh sách, thêm (new/), sửa ([slug]/) sản phẩm
│   │       ├── categories/           # Tương tự, cho danh mục
│   │       └── posts/             # Tương tự, cho bài viết
│   ├── components/
│   │   ├── layout/                # Sidebar
│   │   ├── ui/                     # Button, Field, PageHeader, DeleteButton dùng chung
│   │   ├── product/                 # ProductForm + VariantEditor (form phức tạp nhất — có mảng biến thể)
│   │   ├── category/                 # CategoryForm
│   │   └── blog-post/                 # BlogPostForm
│   ├── lib/
│   │   ├── api.ts                  # Gọi sang apps/api (apiGet cho đọc, apiFetch/apiMutate cho ghi có kèm token)
│   │   ├── session.ts               # Đọc/ghi/xoá cookie chứa JWT (chỉ chạy server-side, có "server-only")
│   │   └── auth-actions.ts           # Server Action đăng xuất
│   └── proxy.ts                       # Chặn truy cập khi chưa đăng nhập (quy ước mới của Next.js 16, thay cho middleware.ts)
└── package.json                        # script "dev" chạy ở cổng 3002 (khác apps/web cổng 3000)
```

**Vì sao là một app riêng, không phải một route `/admin` trong `apps/web`?** Trang quản trị có mô hình bảo mật khác hẳn storefront (yêu cầu đăng nhập, không được search engine index, có thể cần giới hạn truy cập ở tầng hạ tầng riêng như VPN/Cloudflare Access) và giao diện hoàn toàn khác (bảng dữ liệu, form nhập liệu — không phải card sản phẩm). Tách app giúp triển khai độc lập (có thể đặt ở domain phụ `admin.—`) mà không ảnh hưởng tới uptime/hiệu năng của storefront.

**Cách admin ghi dữ liệu:** mỗi trang danh sách gọi `apiGet` (Server Component, không cần token vì endpoint GET công khai). Mỗi form gọi một Server Action (file `actions.ts` cạnh mỗi trang, có `'use server'`) — action này gắn JWT lấy từ cookie rồi gọi `apps/api` bằng `apiMutate`. Không có tầng gọi API nào chạy ở trình duyệt — toàn bộ request tới `apps/api` đều xuất phát từ server Next.js, JWT không bao giờ lộ ra JavaScript phía client (cookie đặt `httpOnly`).

**`ProductForm` phức tạp hơn `CategoryForm`/`BlogPostForm` vì sao?** Một sản phẩm có nhiều biến thể đóng gói (250g/500g/1kg, mỗi loại một giá) — đây là dữ liệu dạng mảng, cần thêm/xoá dòng linh hoạt, nên `VariantEditor` phải là client component quản lý state, rồi nhét kết quả vào một `<input type="hidden" name="variantsJson">` để Server Action đọc được. Category/BlogPost chỉ có field phẳng nên form của chúng render thuần server, không cần state phía client.

## 5. `apps/api` — Backend (NestJS + Prisma)

```
apps/api/
├── prisma/
│   ├── schema.prisma    # Định nghĩa toàn bộ model database — nguồn sự thật của cấu trúc dữ liệu
│   ├── migrations/        # Lịch sử thay đổi schema, do Prisma tự sinh, không sửa tay
│   └── seed.ts             # Nạp dữ liệu mẫu (từ packages/fixtures) vào database
└── src/
    ├── prisma/              # PrismaService/PrismaModule — kết nối database, dùng chung cho mọi module
    ├── auth/                 # Đăng nhập admin: AuthController/Service, JwtAuthGuard, DTO
    ├── products/             # Module sản phẩm: controller (route) + service (logic) + mapper + dto
    ├── categories/            # Module danh mục
    ├── blog-posts/             # Module bài viết
    ├── app.module.ts            # Nơi khai báo tất cả module của ứng dụng
    └── main.ts                    # Điểm khởi động server
```

**Quy tắc thêm module mới:** mỗi nghiệp vụ (đơn hàng, khách hàng, khuyến mãi...) là một thư mục riêng trong `src/`, theo mẫu `products/` đã có: một `*.controller.ts` (định nghĩa route), một `*.service.ts` (logic + gọi Prisma), một `*.module.ts` (khai báo), thư mục `dto/` nếu có endpoint ghi dữ liệu, rồi import module đó vào `app.module.ts`.

**Quy tắc phân quyền route:** `GET` là công khai (storefront cần đọc mà không đăng nhập). `POST`/`PATCH`/`DELETE` gắn `@UseGuards(JwtAuthGuard)` — chỉ admin đã đăng nhập (có JWT hợp lệ trong header `Authorization: Bearer ...`) mới gọi được. Nhìn vào bất kỳ controller nào trong `products/`, `categories/`, `blog-posts/` là thấy ngay mẫu này để áp dụng cho module mới.

**Vì sao dữ liệu API trả về không giống hệt bảng trong database?** `products.mapper.ts` chuyển đổi từ model Prisma (`Product`, `ProductVariant`, `Category` — ba bảng riêng) thành đúng hình dạng `Product` trong `packages/types` (một object lồng nhau) mà frontend mong đợi. Việc này giữ cho cấu trúc database (chuẩn hóa, nhiều bảng) và hợp đồng API (tiện cho frontend dùng) tách biệt nhau — sửa cách lưu trữ trong DB không bắt buộc phải sửa frontend.

## 6. `packages/types` và `packages/fixtures`

Hai package này **không tự chạy được** — chúng chỉ export code để `apps/*` import. Mỗi package có:

```
packages/types/
├── src/           # Mã nguồn TypeScript (product.ts, order.ts...)
├── dist/           # Kết quả build (KHÔNG commit — xem mục 7)
├── package.json     # "main"/"types" trỏ vào dist/, để apps/* import như package npm bình thường
└── tsconfig.json
```

Cần build (`npm run build:packages` ở gốc, hoặc tự động qua hook `postinstall` sau `npm install`) trước khi `apps/web`/`apps/api` có thể dùng được. Nếu sửa file trong `packages/types/src` hoặc `packages/fixtures/src` mà không thấy thay đổi phản ánh sang app khác, khả năng cao là quên build lại package đó.

**Vì sao `types` và `fixtures` là hai package riêng thay vì gộp chung?** `types` chỉ chứa định nghĩa kiểu (không có dữ liệu thật, không phát sinh chi phí runtime). `fixtures` chứa dữ liệu thật (mảng sản phẩm, danh mục...) và phụ thuộc vào `types`. Tách riêng để một package thuần định nghĩa kiểu có thể được dùng ở nơi không cần (hoặc không muốn) kéo theo dữ liệu mẫu.

## 7. Những thứ **không** nằm trong git (và vì sao)

`.gitignore` ở gốc loại trừ các thư mục sau khỏi toàn bộ monorepo (áp dụng cho mọi `apps/*` và `packages/*`, không chỉ thư mục gốc):

| Loại | Ví dụ | Lý do không commit |
|---|---|---|
| `node_modules/` | mọi nơi | Cài lại được từ `package-lock.json` bằng `npm install`, dung lượng rất lớn |
| Build output | `apps/web/.next/`, `apps/admin/.next/`, `apps/api/dist/`, `packages/*/dist/` | Sinh ra từ source code bằng lệnh build, không phải "nguồn" |
| `*.tsbuildinfo` | | Cache riêng của máy đang build, không có ý nghĩa chia sẻ |
| `.env`, `.env.local` | `apps/api/.env`, `apps/admin/.env.local` | Chứa thông tin kết nối database, JWT secret, mật khẩu admin seed... cục bộ — mỗi máy dev/mỗi môi trường có giá trị khác nhau, không commit theo nguyên tắc chung dù giá trị dev hiện tại chưa phải bí mật thật |

Ngược lại, `apps/api/.env.example` và `apps/admin/.env.example` **có** được commit — đây là bản mẫu (không chứa bí mật thật) để người khác biết cần khai báo biến môi trường nào.

## 8. Checklist khi thêm thứ mới vào repo

- Thêm một trang mới cho khách hàng? → `apps/web/src/app/<route>/page.tsx`.
- Thêm một trang quản trị mới (vd. quản lý đơn hàng sau này)? → thư mục mới trong `apps/admin/src/app/(dashboard)/<ten-trang>/`, theo mẫu `products/` (có `page.tsx`, `actions.ts`, `new/page.tsx`, `[slug]/page.tsx`).
- Thêm một API endpoint mới? → module mới trong `apps/api/src/<ten-module>/`, theo mẫu `products/`. Nếu là endpoint ghi dữ liệu, nhớ gắn `@UseGuards(JwtAuthGuard)`.
- Cấu trúc dữ liệu mới cần cả web/admin và api dùng? → thêm type vào `packages/types/src/`, chạy lại `npm run build:packages`.
- Dữ liệu mẫu/nội dung demo mới cần cả web và api? → thêm vào `packages/fixtures/src/`.
- Nội dung chỉ frontend cần (vd. text trang chính sách)? → `apps/web/src/data/`.
- Thêm biến môi trường mới cho backend? → thêm vào `apps/api/.env.example` (có giá trị mẫu) **và** file `.env` cục bộ của bạn (không commit).
