# Kịch bản kiểm thử

Bộ kịch bản kiểm thử **thủ công** cho toàn bộ hệ thống: mọi trang, nút bấm, ô nhập, quy tắc kiểm tra dữ liệu và trường hợp lỗi. Dự án chưa có test tự động (xem [roadmap 2.4](../05-roadmap/roadmap.md#g2--vận-hành-ổn-định-tháng-đầu-sau-ra-mắt)) — các ca trong [api.md](api.md) viết sẵn bằng `curl` để sau này chuyển thành test e2e.

| File | Phạm vi | Số ca |
|---|---|---:|
| [web.md](web.md) | Website khách hàng `apps/web` | 207 |
| [admin.md](admin.md) | Trang quản trị `apps/admin` | 180 |
| [api.md](api.md) | Backend `apps/api` gọi trực tiếp (validate, phân quyền, rate limit, bảo mật) | 132 + ma trận trạng thái 36 ô |
| [e2e.md](e2e.md) | Kịch bản xuyên suốt nhiều app (đặt hàng → xử lý → tra cứu, realtime, phân quyền) | 12 |
| [findings.md](findings.md) | Lỗi / điểm lệch phát hiện khi đọc code để viết kịch bản | — |

## 1. Khi nào chạy

| Tình huống | Chạy |
|---|---|
| Trước khi ra mắt lần đầu | **Toàn bộ** |
| Trước mỗi lần phát hành | Ca **P0** của cả 3 file + toàn bộ [e2e.md](e2e.md) |
| Sửa một tính năng | Ca của tính năng đó + ca P0 liên quan |
| Sau khi cập nhật VPS | Mục "Kiểm tra sau triển khai" trong [deployment.md](../04-operations/deployment.md#4-chạy-lần-đầu) + E2E-01 |

Mức ưu tiên: **P0** chặn phát hành (tiền, đơn hàng, đăng nhập, phân quyền) · **P1** chức năng chính · **P2** hiển thị, trường hợp hiếm.

## 2. Môi trường

- Chạy 3 app trên máy dev ([local-development.md](../04-operations/local-development.md)): web `:3000`, admin `:3002`, API `:4000`.
- **Không chạy trên database production.** Dùng database dev hoặc database staging riêng.
- Rate limit nằm trong bộ nhớ API: **khởi động lại API** để xoá bộ đếm khi đã test xong các ca 429.
- Thiết bị tối thiểu:

| Thiết bị | Trình duyệt | Kích thước |
|---|---|---|
| Máy tính | Chrome mới nhất | 1440 × 900 |
| Máy tính | Firefox hoặc Edge | 1280 × 800 |
| Điện thoại Android | Chrome | 360–412 px |
| iPhone | Safari | 375–430 px |
| (giả lập) | Chrome DevTools | 320 px, 768 px, 1024 px |

## 3. Dữ liệu chuẩn bị

Nạp toàn bộ dữ liệu dưới đây bằng **một lệnh** (chạy lại bất cứ lúc nào để đưa database về trạng thái chuẩn trước một lượt test):

```bash
npm run db:seed:test
```

> ⚠️ Lệnh **xoá sạch** database rồi nạp lại — kể cả tài khoản quản trị đang có. Chỉ chạy được khi `DATABASE_URL` trỏ tới máy cục bộ và `NODE_ENV` khác `production` (staging: thêm `SEED_ALLOW_REMOTE=1`). Script: `apps/api/prisma/seed-test.ts`; ảnh mẫu: `apps/api/prisma/seed-assets/` → chép vào `uploads/seed/`. Xong sẽ tự xoá cache web nếu web đang chạy.

Các kịch bản test dùng đúng mã dưới đây. Sửa dữ liệu mẫu → sửa cả `seed-test.ts` và bảng này.

### Tài khoản
| Mã | Email | Mật khẩu | Vai trò |
|---|---|---|---|
| `ADMIN` | `admin@test.vn` | `Admin@123456` | ADMIN |
| `STAFF1` | `staff1@test.vn` | `Staff@1234` | STAFF — người xử lý đơn trong lịch sử |
| `STAFF2` | `staff2@test.vn` | `Staff@1234` | STAFF — dùng để test khoá / xoá / đặt lại mật khẩu |
| `STAFF3` | `staff3@test.vn` | `Staff@1234` | STAFF **đã khoá** (TC-ADM-012) |

### Danh mục
| Mã | Tên (slug) | Hiển thị | Ghi chú |
|---|---|:-:|---|
| `C1` | Xoài đông lạnh (`xoai-dong-lanh`) | ✅ | có ảnh, có mô tả |
| `C2` | Dâu đông lạnh (`dau-dong-lanh`) | ✅ | |
| `C5` | Trái cây nhiệt đới (`trai-cay-nhiet-doi`) | ✅ | mô tả trống → web hiện câu mặc định |
| `C4` | Danh mục rỗng (`danh-muc-rong`) | ✅ | không có sản phẩm (không hiện ở trang chủ, xoá được) |
| `C3` | Danh mục ẩn (`danh-muc-an`) | ❌ | chứa `P5` |

### Sản phẩm
| Mã | Tên (slug) | Danh mục | Quy cách (khối lượng – giá – giá gốc – tồn kho) | Cờ |
|---|---|---|---|---|
| `P1` | Xoài cát cắt miếng (`xoai-cat-cat-mieng`) | C1 | 500g (500 g – 85.000 – 100.000 – còn hàng, SKU `XCM-500`) · 1kg (1000 g – 160.000 – – còn hàng, `XCM-1K`) | Nổi bật, 3 ảnh |
| `P2` | Dâu tây đông lạnh | C2 | 500g (– 120.000 – – **hết hàng**) | 1 ảnh |
| `P3` | Sầu riêng Ri6 | C1 | 1kg (1000 g – 250.000 – – **sắp hết**) · 2kg (2000 g – 480.000 – – **hết hàng**) | Nổi bật, Nhận sỉ, **không ảnh** |
| `P4` | Mãng cầu (ngừng bán) | C1 | 500g – 70.000 | **Đang bán = tắt** |
| `P5` | Bơ sáp | C3 (ẩn) | 500g – 60.000 | |
| `P6` | Thanh long ruột đỏ cắt hạt lựu | C5 | 500g 45.000 · 1kg 85.000 · Thùng 5kg 400.000 | Nhận sỉ |
| `P7` | Nho xanh không hạt | C5 | 500g – 95.000 – 110.000 | 2 ảnh |
| `P8` | Mít Thái múi | C5 | Hộp 500g – 55.000, **không khối lượng** | thiếu mô tả, bảo quản, ảnh (kiểm tra khối tự ẩn) |
| `P9` | Dâu tây cắt lát | C2 | 250g – 65.000 · 500g – 120.000 **quy cách tắt bán** | web chỉ hiện 250g |

### Đơn hàng và liên hệ
**8 đơn cố định** của khách `0905123456`, mã `DH{yyMMdd}TSTA` … `TSTH` (ngày theo lúc seed — script in danh sách mã khi chạy xong):

| Mã | Trạng thái | Đặc điểm |
|---|---|---|
| `…TSTA` | Chờ xác nhận | hôm nay, có email + ghi chú, P1 500g × 2 + P3 1kg — tổng 420.000 |
| `…TSTB` | Đã xác nhận | chuyển khoản, chưa thanh toán, phí ship 30.000 |
| `…TSTC` | Đang đóng gói | |
| `…TSTD` | Đang giao | có ghi chú nội bộ (mã vận đơn) |
| `…TSTE` | Đã giao | chuyển khoản đã thanh toán, phí ship 25.000, giảm 10.000 |
| `…TSTF` | Đã huỷ | |
| `…TSTG` | Đã giao | có dòng của **sản phẩm đã xoá** (chỉ còn bản chụp) |
| `…TSTH` | Chờ xác nhận | tên / địa chỉ / ghi chú chứa **mã HTML** (test XSS) |

- **60 đơn lịch sử** rải đều 13 tháng (~88 % đã giao, ~12 % huỷ, COD và chuyển khoản) cho trang Tổng quan, biểu đồ 7/30/90/365 ngày và phân trang. Sinh theo hạt giống cố định — lần chạy nào cũng giống nhau (trừ ngày tính lùi từ hôm nay).
- **8 liên hệ**: Mới / Đang xử lý / Xong, cả "Liên hệ" và "Báo giá sỉ", một liên hệ chứa mã HTML.

### Nội dung
| Mã | Loại | Thiết lập |
|---|---|---|
| `B1`, `B2`, `B3` | Banner | B1: tiêu đề + mô tả + liên kết `/products` + nút "Mua ngay"; B2: chỉ ảnh; B3: **tắt** |
| `N1` | Bài viết | `cach-ra-dong-trai-cay` — đã đăng hôm qua, có ảnh bìa |
| — | Bài viết | 2 bài đã đăng cũ hơn (1 bài không có ảnh bìa) |
| `N2` | Bài viết | `bai-hen-gio` — hẹn giờ ngày mai |
| `N3` | Bài viết | `bai-nhap` — tắt hiển thị |
| `POL1` | Chính sách | `chinh-sach-doi-tra` — nội dung từ mẫu "Chính sách bảo hành & đổi trả" (xoá đi để test gợi ý mẫu, TC-ADM-330) |
| — | Chính sách | Giao hàng, Bảo mật — hiển thị |
| `POL2` | Chính sách | `chinh-sach-noi-bo` — **tắt** |
| `SET` | Thông tin cửa hàng | Thông tin thật của cửa hàng + dải chữ chạy tự nhập + thông tin chuyển khoản (TÀI KHOẢN TEST) |

### Dữ liệu nhập dùng chung
| Loại | Hợp lệ | Không hợp lệ |
|---|---|---|
| SĐT | `0905123456`, `0905 123 456`, `0905.123.456`, `+84905123456`, `02363123456` (cố định 11 số) | `12345`, `090512345a`, `84905123456` (thiếu `+`), `0905-123-456` (gạch ngang), `090512345678` (quá dài) |
| Email | `khach@test.vn` | `khach@`, `khach.test.vn`, `@test.vn` |
| Địa chỉ | `12 Lê Duẩn, Hải Châu, Đà Nẵng` | `Đà Nẵng` (< 10 ký tự) |
| Ảnh | `.jpg`, `.png`, `.webp`, `.gif` ≤ 5 MB | `.svg`, `.pdf`, `.txt` đổi đuôi thành `.jpg`, ảnh 6 MB |

## 4. Cách ghi kết quả

- Mỗi ca có cột **KQ**: ghi ✅ đạt · ❌ lỗi · ⏭ bỏ qua (ghi lý do).
- Sao chép file sang `docs/06-testing/runs/YYYY-MM-DD.md` (hoặc bảng tính) khi chạy, không sửa file gốc.
- Ca ❌ → tạo issue GitHub theo mẫu:

```
Tiêu đề: [TC-WEB-061] Đặt hàng với SĐT +84 báo lỗi
Môi trường: Chrome 130 / Android 14, máy dev, commit abc1234
Các bước: 1. ... 2. ... 3. ...
Mong đợi: ...
Thực tế: ...   (kèm ảnh chụp / video, log console, log API)
Mức độ: P0 / P1 / P2
```

## 5. Tổng hợp một lần chạy

| Ngày | Người test | Commit | Web (đạt/tổng) | Admin | API | E2E | Ghi chú |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
