# Deploy bản demo cho khách xem — miễn phí

Mục tiêu: có link công khai cho **website** và **trang quản trị** với dữ liệu mẫu đầy đủ, **0 đồng**, làm trong khoảng 1–2 giờ, không cần VPS. Bản chạy thật lâu dài vẫn theo [deployment.md](deployment.md) (VPS + Docker).

| Phần | Đặt ở (gói miễn phí) | Ghi chú |
|---|---|---|
| `apps/web` (website khách) | **Vercel** Hobby | Next.js chạy tốt nhất trên Vercel |
| `apps/admin` (trang quản trị) | **Vercel** Hobby | Project thứ hai, cùng repo |
| `apps/api` (NestJS) | **Render** Free (Docker) | Ngủ sau 15 phút không ai gọi — xem [mục 6](#6-giữ-api-không-ngủ-uptimerobot) để giữ thức |
| PostgreSQL | **Neon** Free | Miễn phí vĩnh viễn, 1 GB / project, không cần thẻ |

```
Khách ──► https://<web>.vercel.app ──┐
                                      ├──► https://<api>.onrender.com ──► Neon PostgreSQL
Chủ shop ► https://<admin>.vercel.app ┘
```

## 0. So sánh các nơi đặt API (vì sao không dùng Railway)

Số liệu theo trang giá của từng dịch vụ (tháng 10/2026) — **kiểm tra lại trước khi làm**, các gói miễn phí hay thay đổi.

| Dịch vụ | Miễn phí thế nào | Hợp với demo? |
|---|---|---|
| **Railway** | Dùng thử **5 USD một lần, hết hạn sau 30 ngày**, không cần thẻ. Sau đó gói Free chỉ có **1 USD/tháng** (1 vCPU, 0,5 GB RAM, 1 project) — không đủ cho API + Postgres chạy liên tục cả tháng; muốn chạy tiếp phải lên gói Hobby **5 USD/tháng** | Tốt nhất về kỹ thuật (có ổ đĩa lưu ảnh) nhưng **chỉ miễn phí ~30 ngày** |
| **Render** Free | 750 giờ chạy / tháng (đủ 1 service chạy cả tháng), **ngủ sau 15 phút** không có request, thức dậy mất **~1 phút**; **không có ổ đĩa lâu dài** (khởi động lại là mất file tải lên); Postgres miễn phí của Render **hết hạn sau 30 ngày** | Dùng cho API, **không dùng Postgres của Render** |
| **Neon** Free | Postgres **miễn phí vĩnh viễn**, 1 GB / project, tự tạm dừng sau 5 phút rảnh (gọi lại thức trong ~1 giây), không cần thẻ | Dùng cho database |
| **Vercel** Hobby | Miễn phí; điều khoản chỉ cho **dùng phi thương mại** | Demo cho khách xem tạm được; chạy thật cho cửa hàng nên lên Pro hoặc VPS |

**Hệ quả của phương án miễn phí** (đã xử lý sẵn trong code / hướng dẫn):

| Hạn chế | Ảnh hưởng | Cách xử lý |
|---|---|---|
| Render không có ổ đĩa lâu dài | Ảnh admin **tải lên trong lúc demo** mất khi API khởi động lại / deploy lại | Ảnh **dữ liệu mẫu** API lấy thẳng từ code (`prisma/seed-assets`) nên **không bao giờ mất**. Ảnh tải thêm khi demo: tải lại nếu cần, hoặc nâng cấp sau (Cloudinary / VPS) |
| Render ngủ sau 15 phút | Lần mở đầu tiên chờ ~1 phút | Website vẫn hiện ngay từ cache của Vercel; đặt UptimeRobot gọi `/health` 5 phút/lần ([mục 6](#6-giữ-api-không-ngủ-uptimerobot)) |
| Neon tạm dừng sau 5 phút | Truy vấn đầu tiên chậm ~1 giây | Không cần làm gì |

> Muốn **ổn định hơn, không ngủ, giữ được ảnh tải lên**: dùng Railway (miễn phí 30 ngày đầu, sau đó 5 USD/tháng) — làm theo [Phụ lục A](#phụ-lục-a--đặt-api-trên-railway-thay-cho-render).

---

## 1. Chuẩn bị

1. **Commit và push code lên GitHub** (Vercel / Render lấy code từ GitHub):
   ```bash
   git status            # không còn file lạ (ví dụ .buildcheck/)
   git add -A
   git commit -m "Chuẩn bị deploy demo"
   git push -u origin admin
   ```
   Nên deploy từ một nhánh cố định (ví dụ `main` hoặc `demo`): mỗi lần push là bản demo tự cập nhật.
2. Tạo tài khoản **Neon**, **Render**, **Vercel** (đăng nhập bằng GitHub), cấp quyền đọc repo cho Render và Vercel.
3. Tạo 2 chuỗi bí mật (giữ lại để dán):
   ```bash
   openssl rand -base64 48   # → JWT_SECRET
   openssl rand -hex 24      # → REVALIDATE_SECRET (dùng chung cho API và web)
   ```
   Không có `openssl`: dùng trình tạo mật khẩu bất kỳ, ≥ 48 ký tự ngẫu nhiên.

Thứ tự bắt buộc: **database → API → web, admin → điền chéo địa chỉ** (web cần địa chỉ API lúc build).

---

## 2. Database trên Neon

1. Neon → **Create project** → đặt tên `traicay28-demo`, chọn vùng **Singapore** (gần Việt Nam nhất).
2. **Connection string** → chọn **không** bật "Connection pooling" (dùng kết nối trực tiếp — Prisma `migrate` cần kết nối trực tiếp, và demo chỉ có 1 API). Chuỗi có dạng:
   ```
   postgresql://<user>:<password>@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Tạo bảng + nạp dữ liệu mẫu **ngay từ máy của bạn** (trong thư mục repo):

   **PowerShell (Windows):**
   ```powershell
   cd apps/api
   $env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
   npx prisma migrate deploy
   $env:SEED_ALLOW_REMOTE = "1"
   $env:SEED_DEMO = "1"           # bản cho khách: bỏ dữ liệu test bảo mật
   npm run prisma:seed-test
   Remove-Item Env:DATABASE_URL, Env:SEED_ALLOW_REMOTE, Env:SEED_DEMO   # tránh lỡ tay chạy lệnh khác vào Neon
   ```
   **Bash (macOS / Linux / Git Bash):**
   ```bash
   cd apps/api
   export DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
   npx prisma migrate deploy
   SEED_ALLOW_REMOTE=1 SEED_DEMO=1 npm run prisma:seed-test
   unset DATABASE_URL
   ```
   Lệnh seed **xoá sạch** database rồi nạp lại dữ liệu mẫu — chạy lại bất cứ lúc nào để đưa demo về ban đầu. Muốn database **trống, không dữ liệu mẫu**: xem [mục 8](#8-khởi-tạo-lại-database-sạch-không-dữ-liệu-mẫu).

Tài khoản sau khi seed:

| Tài khoản | Mật khẩu | Quyền |
|---|---|---|
| `admin@test.vn` | `Admin@123456` | Chủ cửa hàng (toàn quyền) |
| `staff1@test.vn` | `Staff@1234` | Nhân viên — mọi mục |
| `staff2@test.vn` | `Staff@1234` | Nhân viên — chỉ Đơn hàng + Liên hệ |

**Đổi mật khẩu admin** (Tài khoản của tôi) trước khi gửi link. Cho khách đăng nhập thử thì đưa tài khoản nhân viên, không đưa tài khoản admin.

---

## 3. API trên Render

1. Render → **New → Web Service** → chọn repo + nhánh.
2. Cấu hình:
   | Mục | Giá trị |
   |---|---|
   | Language / Runtime | **Docker** |
   | Root Directory | để trống (gốc repo) |
   | Dockerfile Path | `deploy/api.Dockerfile` |
   | Docker Build Context | `.` |
   | Region | **Singapore** |
   | Instance Type | **Free** |
   | Health Check Path (Advanced) | `/health` |
3. **Environment Variables**:
   | Biến | Giá trị |
   |---|---|
   | `DATABASE_URL` | chuỗi Neon ở bước 2 |
   | `PUBLIC_URL` | `https://<api>.onrender.com` (tên hiện ngay trên trang tạo service; sửa lại nếu khác) |
   | `JWT_SECRET` | chuỗi ở bước 1.3 |
   | `JWT_EXPIRES_IN` | `12h` |
   | `REVALIDATE_SECRET` | chuỗi ở bước 1.3 |
   | `CORS_ORIGINS` | tạm `http://localhost:3000` — sửa ở [mục 5](#5-điền-chéo-địa-chỉ-rồi-deploy-lại) |
   | `WEB_REVALIDATE_URL` | tạm để trống — sửa ở mục 5 |
   | `OTP_ENCRYPTION_KEY` | `openssl rand -base64 32` — khoá mã hoá OTP; **đặt một lần, không đổi** sau khi đã có người bật OTP |
   | `SENTRY_DSN` | (tuỳ chọn) theo dõi lỗi — [monitoring-and-backup.md §2.1](monitoring-and-backup.md#21-bật-sentry-theo-dõi-lỗi-gói-miễn-phí-5000-lỗi--tháng) |

   `PORT` do Render tự đặt, API đọc biến này. Dockerfile đặt sẵn `NODE_ENV=production` và tự chạy `prisma migrate deploy` khi khởi động.
4. **Create Web Service** → chờ build (5–10 phút lần đầu). Mở `https://<api>.onrender.com/health` → thấy `{"status":"ok",...}`; mở `/uploads/seed/banner-1.jpg` → thấy ảnh.

---

## 4. Website và trang quản trị trên Vercel

**Website** — Vercel → **Add New → Project** → import repo:

| Mục | Giá trị |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Install Command | `cd ../.. && npm ci` (cài cả monorepo; `postinstall` tự build `packages/types`) |
| Build Command | mặc định |
| Node.js Version (Settings → General) | 22.x |
| `NEXT_PUBLIC_API_URL` | `https://<api>.onrender.com` |
| `REVALIDATE_SECRET` | trùng với API |
| `NEXT_PUBLIC_ADMIN_URL` | tạm để trống — sửa ở mục 5 |
| `DESIGNER_NAME` / `DESIGNER_URL` | (tuỳ chọn) dòng "Designed by" cuối trang |
| `NEXT_PUBLIC_SENTRY_DSN` | (tuỳ chọn) theo dõi lỗi — loại **Config**; thêm cho cả project admin |

Trước khi bấm Deploy, **mở `https://<api>.onrender.com/health` cho API thức dậy** — web lấy dữ liệu từ API lúc build.

> **Nhánh deploy:** lúc import, Vercel build từ nhánh mặc định của repo (`main`). Sau khi tạo project: **Settings → Git → Production Branch** = `demo` → **Deployments → Create Deployment** → nhập `demo` → **Create**. Từ đó mỗi lần push nhánh `demo` là tự deploy lại. Làm giống hệt cho project admin.

**Trang quản trị** — tạo **project thứ hai** từ cùng repo:

| Mục | Giá trị |
|---|---|
| Root Directory | `apps/admin` |
| Install Command | `cd ../.. && npm ci` |
| `API_URL` | `https://<api>.onrender.com` |
| `NEXT_PUBLIC_WEB_URL` | `https://<web>.vercel.app` |

## 5. Điền chéo địa chỉ rồi deploy lại

| Ở đâu | Biến | Giá trị |
|---|---|---|
| Render (API) | `CORS_ORIGINS` | `https://<web>.vercel.app,https://<admin>.vercel.app` |
| Render (API) | `WEB_REVALIDATE_URL` | `https://<web>.vercel.app/api/revalidate` |
| Vercel (web) | `NEXT_PUBLIC_ADMIN_URL` | `https://<admin>.vercel.app` |

Render tự deploy lại khi lưu biến. Vercel web: **Deployments → ⋯ → Redeploy** (biến `NEXT_PUBLIC_*` gắn vào lúc build nên **bắt buộc** build lại).

Tên miền riêng (ví dụ `demo.traicay28.vn`): Vercel / Render → Domains → thêm và tạo bản ghi DNS theo hướng dẫn, rồi sửa lại các biến ở bảng trên.

## 6. Giữ API không ngủ (UptimeRobot)

Render Free ngủ sau 15 phút không có request; lần đầu gọi lại phải chờ ~1 phút (khách đặt hàng / admin đăng nhập sẽ thấy chậm).

1. Tạo tài khoản miễn phí tại **uptimerobot.com**.
2. **Add New Monitor** → loại **HTTP(s)** → URL `https://<api>.onrender.com/health` → **Interval 5 minutes**.

750 giờ miễn phí / tháng của Render đủ cho 1 service chạy liên tục cả tháng. Không muốn dùng: trước buổi gặp khách, mở `/health` trước 1–2 phút là đủ.

---

## 7. Kiểm tra trước khi gửi link cho khách

| # | Thử | Kết quả đúng |
|---|---|---|
| 1 | Mở website: trang chủ, sản phẩm, chi tiết, tin tức, giới thiệu, liên hệ | Có ảnh, có dữ liệu, bản đồ có ghim |
| 2 | Thêm vào giỏ → thanh toán → đặt hàng | Hiệu ứng xe tải, bill in ra, tải ảnh bill / lưu PDF được |
| 3 | Tra cứu đơn hàng | Thấy bill vừa lưu; tra bằng mã + SĐT ra đúng đơn |
| 4 | Đăng nhập admin | Hiệu ứng đăng nhập, Tổng quan có số liệu |
| 5 | Admin: đơn vừa đặt xuất hiện | Có đơn mới, xác nhận được |
| 6 | Admin sửa giá một sản phẩm → mở lại website | Giá mới hiện sau vài giây |
| 7 | Admin → Xem trước & sửa | Web hiện trong khung, bấm đúp mở đúng trang sửa |
| 8 | Admin → Lịch sử chỉnh sửa | Thấy các thao tác vừa làm |
| 9 | Mở website trên điện thoại thật | Menu dưới, nút liên hệ, vuốt banner hoạt động |

| Hiện tượng | Nguyên nhân / cách sửa |
|---|---|
| Web không có dữ liệu, ảnh vỡ | API đang ngủ / `NEXT_PUBLIC_API_URL` sai lúc build → đánh thức API rồi Redeploy web |
| Lần đầu mở rất chậm (~1 phút) | Render đang thức dậy — đặt UptimeRobot (mục 6) |
| Đặt hàng / gửi liên hệ báo lỗi mạng | `CORS_ORIGINS` thiếu đúng địa chỉ web (không có `/` cuối) |
| Admin đăng nhập xong bị đá ra | `API_URL` của admin sai, hoặc đổi `JWT_SECRET` giữa chừng (đăng nhập lại) |
| Sửa trong admin mà web 5 phút sau mới đổi | `WEB_REVALIDATE_URL` / `REVALIDATE_SECRET` không khớp |
| Ảnh vừa tải lên trong admin biến mất | Render khởi động lại / deploy lại (ổ đĩa tạm) — tải lại ảnh; ảnh dữ liệu mẫu không bị ảnh hưởng |
| Tải ảnh > ~4 MB lỗi | Giới hạn request của Vercel (~4,5 MB) — nén ảnh trước |
| "Xem trước & sửa" trắng trang | `NEXT_PUBLIC_ADMIN_URL` (web) / `NEXT_PUBLIC_WEB_URL` (admin) sai → sửa và Redeploy |

**Nói trước với khách:** dữ liệu là mẫu, đơn đặt thử không giao thật; thanh toán chỉ COD, chưa gửi email / Zalo xác nhận; bill lưu trên trình duyệt của chính khách; danh sách tính năng chưa làm ở [features.md](../01-product/features.md) (dòng ⬜).

---

## 8. Khởi tạo lại database sạch (không dữ liệu mẫu)

Dùng khi muốn demo bắt đầu từ **trang trắng** (khách tự nhập sản phẩm), hoặc bàn giao cho cửa hàng dùng thật. Lệnh `db:reset:clean` sẽ:

1. **Xoá toàn bộ bảng** và chạy lại mọi migration (`prisma migrate reset --skip-seed`);
2. Xoá thư mục ảnh tải lên **trên máy đang chạy lệnh** (nếu có);
3. Tạo **một tài khoản ADMIN** từ `ADMIN_EMAIL` / `ADMIN_PASSWORD` (mật khẩu ≥ 12 ký tự).

Bảo vệ: từ chối khi `NODE_ENV=production`; database không ở máy cục bộ thì phải đặt `RESET_ALLOW_REMOTE=1`.

**Database trên máy (local):**
```bash
ADMIN_EMAIL=chu@cuahang.vn ADMIN_PASSWORD='MatKhauRatManh2026' npm run db:reset:clean
```

**Database demo trên Neon — PowerShell:**
```powershell
cd apps/api
$env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
$env:RESET_ALLOW_REMOTE = "1"
$env:ADMIN_EMAIL = "chu@cuahang.vn"
$env:ADMIN_PASSWORD = "MatKhauRatManh2026"
npm run prisma:reset-clean
Remove-Item Env:DATABASE_URL, Env:RESET_ALLOW_REMOTE, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```
**Bash:**
```bash
cd apps/api
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" RESET_ALLOW_REMOTE=1 \
  ADMIN_EMAIL=chu@cuahang.vn ADMIN_PASSWORD='MatKhauRatManh2026' npm run prisma:reset-clean
```

Sau khi chạy:
- Web vẫn hoạt động, dùng **thông tin cửa hàng mặc định** và **trang Giới thiệu mặc định**; chưa có sản phẩm, banner, bài viết, chính sách, đơn hàng, **khối trang chủ** → trang chủ chỉ còn header, các mục trống và footer. Phần chữ lớn đầu trang ("Tươi tự nhiên. Đông lạnh đúng cách.") giờ là một **khối trang chủ**: tạo lại ở admin → Khối trang chủ (dùng các nút Nhãn / Tiêu đề to / Đoạn dẫn / Nút).
- Đăng nhập admin bằng email vừa đặt, rồi làm theo thứ tự: **Thông tin cửa hàng** → **Chính sách** (bấm các nút "nội dung soạn sẵn") → **Danh mục** → **Sản phẩm** → **Banner** → **Bài viết** → tạo **tài khoản nhân viên** và phân quyền.
- Web tự làm mới sau tối đa 5 phút (hoặc ngay khi admin lưu, nếu đã đặt `WEB_REVALIDATE_URL`). Muốn thấy ngay: Vercel → Redeploy web.

Muốn quay lại dữ liệu mẫu: chạy lại lệnh seed ở [mục 2](#2-database-trên-neon).

---

## 9. Gỡ demo

Vercel: từng project → Settings → **Delete**. Render: service → Settings → **Delete Web Service**. Neon: project → Settings → **Delete project**. UptimeRobot: xoá monitor. Đổi lại `JWT_SECRET` nếu dùng chung cho bản thật.

---

## Phụ lục A — Đặt API trên Railway thay cho Render

Ổn định hơn (không ngủ, có ổ đĩa lưu ảnh tải lên) nhưng chỉ miễn phí **30 ngày đầu** (5 USD dùng thử), sau đó **5 USD/tháng** (gói Hobby).

1. Railway → **New Project** → **GitHub Repo** → chọn repo. Settings: Builder **Dockerfile**, Dockerfile Path `deploy/api.Dockerfile`, Healthcheck `/health`, Networking → **Generate Domain**.
2. **Add Volume** mount `/data`, đặt biến `UPLOAD_DIR=/data/uploads` → ảnh tải lên không mất khi deploy lại.
3. Database: dùng Neon như mục 2 (hoặc thêm Postgres của Railway và đặt `DATABASE_URL=${{Postgres.DATABASE_URL}}`).
4. Các biến còn lại giống [mục 3](#3-api-trên-render); địa chỉ API là `https://<api>.up.railway.app`.

## Phụ lục B — Đặt cả API trên Vercel

Làm được nhưng **phải sửa code trước** (ước tính 0,5–1 ngày): chuyển lưu ảnh sang Vercel Blob / Cloudinary; realtime SSE bị ngắt định kỳ vì Vercel chạy kiểu serverless (nhiều bản chạy song song không chung bộ nhớ); rate limit đếm riêng từng bản. Cho mục đích demo, phương án Vercel + Render + Neon ở trên đơn giản hơn.
