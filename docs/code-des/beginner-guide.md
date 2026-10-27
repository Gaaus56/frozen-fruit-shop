# Hiểu cả dự án mà không cần biết code

Tài liệu dành cho người **chưa biết lập trình**. Giải thích dự án làm gì, các phần nói chuyện với nhau ra sao, cách đọc thư mục `code-des` và các kỹ thuật thiết kế dùng trong dự án.

Bạn cứ hình dung dự án như **một cửa hàng có ba "cửa" cùng dùng chung một "kho"**.

---

## 1. Bức tranh lớn: ví dụ nhà hàng

| Trong dự án | Ví dụ nhà hàng | Nhiệm vụ |
|---|---|---|
| **web** (`apps/web`) | Phòng ăn cho khách | Khách xem sản phẩm, bỏ giỏ, đặt hàng |
| **admin** (`apps/admin`) | Phòng quản lý cho chủ và nhân viên | Sửa sản phẩm, xử lý đơn, viết bài |
| **api** (`apps/api`) | Quầy phục vụ / quản lý kho | Mọi quyết định và quy tắc nằm ở đây |
| **database** (PostgreSQL) | Kho lưu trữ | Chứa dữ liệu thật: sản phẩm, đơn, tài khoản |
| **packages/types** | Cuốn thực đơn chung | Ba app cùng dùng một định nghĩa "sản phẩm là gì, đơn là gì" |

Điểm quan trọng nhất: **web và admin không bao giờ đụng thẳng vào kho.** Họ chỉ nói chuyện với API, và API mới được đụng vào database.

```
 Khách (điện thoại)             Chủ shop / nhân viên
        │                               │
        ▼                               ▼
   ┌─────────┐                    ┌──────────┐
   │   WEB   │                    │  ADMIN   │
   │ :3000   │                    │  :3002   │
   └────┬────┘                    └────┬─────┘
        │        hỏi / ra lệnh         │
        └──────────────┬───────────────┘
                       ▼
                 ┌───────────┐
                 │    API    │  ← bộ não: kiểm tra, tính tiền, phân quyền
                 │   :4000   │
                 └─────┬─────┘
                       ▼
                 ┌───────────┐
                 │ DATABASE  │  ← kho dữ liệu
                 └───────────┘
```

**Vì sao thiết kế vậy?** Nếu web tự tính tiền thì khách có thể sửa giá trong trình duyệt. Để API tính thì gian lận không được. Mọi quy tắc nằm một chỗ nên cũng không bị mâu thuẫn giữa web và admin.

---

## 2. Từng thành phần làm gì

### Web: nơi khách mua hàng
- Viết bằng **Next.js** (một bộ công cụ làm website, chạy được cả phía máy chủ lẫn trình duyệt).
- Các trang chính: Trang chủ `/`, Sản phẩm `/products`, Chi tiết sản phẩm, Giỏ hàng `/cart`, Thanh toán `/checkout`, Tra cứu đơn, Tin tức, Liên hệ, Giới thiệu, Chính sách.
- **Giỏ hàng nằm ngay trong trình duyệt của khách** (`localStorage`), chưa gửi lên máy chủ cho đến khi bấm đặt hàng.

### Admin: nơi vận hành
- Cũng là Next.js, nhưng phải **đăng nhập**.
- Có hai loại tài khoản:
  - **ADMIN** (chủ, đúng 1 người) làm được tất cả.
  - **STAFF** (nhân viên) chỉ vào được mục được chủ cấp quyền.
- Chức năng: xem doanh thu, xử lý đơn, quản lý sản phẩm / danh mục / banner / bài viết / bình luận / chính sách, sửa thông tin cửa hàng, xem lịch sử ai sửa gì.

### API: bộ não
Chia thành các "ngăn" (module), mỗi ngăn lo một việc. Ví dụ `orders` lo đơn hàng, `products` lo sản phẩm, `auth` lo đăng nhập, `uploads` lo tải ảnh. Việc nào cũng phải đi qua các lớp kiểm tra: **có hợp lệ không, có đăng nhập không, có quyền không, có đang spam không**.

### Database: kho
Là các "bảng tính" lớn. Các bảng chính:
- **Sản phẩm**: `Category` (danh mục) → `Product` → `ProductVariant` (quy cách: 500g, 1kg…, mỗi quy cách có giá riêng) và `ProductImage`.
- **Đơn hàng**: `Order` → `OrderItem` (từng món), `OrderStatusLog` (nhật ký đổi trạng thái).
- **Khác**: `User`, `Inquiry` (liên hệ), `Post`, `Comment`, `Banner`, `Policy`, `Page`, `HomeBlock`, `SiteSetting`, `AuditLog`.

---

## 3. Cách đọc thư mục `docs/code-des`

Mỗi file trả lời câu hỏi: **"Trang / chức năng này trên màn hình có gì, và nằm ở file code nào?"**

```
code-des/
├── README.md        ← bắt đầu từ đây
├── web/             ← mỗi file = 1 trang của khách
├── admin/           ← mỗi file = 1 màn hình quản trị
└── api/             ← mỗi file = 1 module backend
```

Mỗi file đều có hai phần:
1. **Phần mô tả**: danh sách đánh số các khối bạn thấy trên màn hình, từ trên xuống dưới.
2. **Phần "Code"**: các đường dẫn file tương ứng, để dev biết mở file nào.

**Thứ tự đọc cho người mới (khoảng 30–40 phút):**
1. [README.md](README.md)
2. [web/home.md](web/home.md) → [web/product-detail.md](web/product-detail.md) → [web/cart.md](web/cart.md) → [web/checkout.md](web/checkout.md) (hành trình mua hàng)
3. [admin/orders.md](admin/orders.md) (hành trình xử lý đơn)
4. [api/orders.md](api/orders.md) (phía sau hậu trường)
5. [api/core.md](api/core.md) rồi [admin/shared.md](admin/shared.md) (các nền tảng chung)

Nên đọc **theo hành trình**, đừng đọc theo thứ tự bảng chữ cái.

---

## 4. Luồng chạy từ đầu đến cuối

### Luồng A: khách xem sản phẩm

```
1. Khách gõ địa chỉ web  →  vào trang /products
2. Máy chủ web hỏi API:  "cho tôi danh sách sản phẩm đang bán"
3. API hỏi database, lọc bỏ sản phẩm đang ẩn, trả kết quả
4. Web dựng thành trang HTML đẹp rồi gửi cho khách
5. Web ghi nhớ kết quả này 5 phút (cache) để khách sau khỏi hỏi lại API
```

**Cache là gì?** Như ghi nhớ đáp án để khỏi tính lại. Nhờ vậy web nhanh và API đỡ tải. Cái giá phải trả là dữ liệu có thể cũ tối đa 5 phút. Luồng D bên dưới giải quyết vấn đề này.

### Luồng B: khách đặt hàng (quan trọng nhất)

```
Khách bấm "Thêm vào giỏ"
   → giỏ lưu trong trình duyệt (chưa lên máy chủ)

Khách vào /checkout
   → web gửi giỏ lên API: "báo giá giúp tôi" (quote)
   → API tra giá THẬT trong database, kiểm tra còn hàng không
   → trả về: tổng tiền chuẩn + dòng nào hết hàng

Khách điền tên, SĐT, địa chỉ → bấm "Đặt hàng"
   → API kiểm tra lại LẦN NỮA từ đầu (không tin số tiền khách gửi)
   → lưu đơn, tạo mã đơn dạng DH261013AB7K
   → báo cho admin "có đơn mới"

Web nhận mã đơn
   → "in" ra bill giấy nhiệt, lưu bill vào máy khách
   → xoá giỏ
```

Hai điều đáng chú ý:
- **API không tin giá từ trình duyệt.** Giá và tồn kho luôn được tính lại.
- Mỗi món trong đơn **lưu cứng tên và giá lúc đặt**. Sau này chủ sửa giá hay xoá sản phẩm thì đơn cũ không bị đổi.

### Luồng C: chủ xử lý đơn

```
Admin mở /orders → thấy đơn "Chờ xác nhận"
   → gọi điện khách, chốt phí ship
   → bấm "Xác nhận đơn" → "Đóng gói" → "Giao" → "Đã giao"
```

Trạng thái chỉ đi **theo một chiều** (không nhảy lùi, đơn đã giao hay đã huỷ thì khoá). Mỗi lần đổi đều ghi vào nhật ký kèm tên người đổi.

### Luồng D: chủ sửa giá sản phẩm, khách thấy ngay

```
Admin sửa giá, bấm Lưu
   → API ghi vào database
   → API thông báo 3 việc:
        ① cho các admin khác đang mở: "dữ liệu vừa đổi"
        ② cho web: "xoá bộ nhớ đệm đi" (revalidate)
        ③ cho khách đang mở web: "tải lại trang đi"
   → khách thấy giá mới trong chớp mắt, không cần F5
```

---

## 5. Các kỹ thuật thiết kế, giải thích bằng ví dụ

### 5.1 Monorepo (một kho code chứa nhiều app)
Cả 3 app và gói chung nằm trong một thư mục. Sửa cuốn "thực đơn chung" (`packages/types`) một chỗ, cả 3 app cùng thấy; nếu có chỗ dùng sai thì trình kiểm tra báo lỗi ngay.

### 5.2 Cache và revalidate
Đã giải thích ở luồng A và D. Tóm lại: **nhớ đáp án cho nhanh, nhưng có "chuông" để xoá khi dữ liệu đổi.**

### 5.3 Realtime bằng SSE
Bình thường trình duyệt phải hỏi liên tục "có gì mới không?". SSE là mở một "đường ống" một chiều, máy chủ tự đẩy thông báo qua. Dùng cho: admin nghe tiếng "có đơn mới", khách đang xem tự thấy dữ liệu mới.

Trình duyệt chỉ cho mở khoảng 6 đường ống cùng lúc. Nên dự án cho **nhiều tab dùng chung một ống**: một tab "trưởng" giữ ống rồi chuyển tin cho các tab còn lại.

### 5.4 Đăng nhập và phân quyền
- Đăng nhập đúng thì API đưa một **token (JWT)**, như vé vào cửa có ghi tên và vai trò.
- Token được cất trong **cookie httpOnly**: JavaScript trên trang không đọc được, nên mã độc khó đánh cắp.
- **Mỗi lần gọi, API đều kiểm tra lại database** xem tài khoản còn hoạt động không và còn quyền không. Vì vậy chủ khoá tài khoản hay bỏ quyền thì có hiệu lực **ngay**, không phải chờ vé hết hạn.
- Sai mật khẩu 5 lần thì bị khoá 15 phút.

### 5.5 OTP (xác thực 2 lớp)
Ngoài mật khẩu còn cần mã 6 số đổi mỗi 30 giây từ app Google / Microsoft Authenticator. Nó áp thêm cho các việc nhạy cảm (đổi mật khẩu, sửa thông tin cửa hàng, quản lý nhân viên):
- Nhập đúng mã một lần thì dùng được 10 phút.
- Có 8 mã dự phòng, mỗi mã chỉ dùng một lần.
- Khoá bí mật được mã hoá trong database.

### 5.6 Chống lạm dụng
- **Rate limit**: giới hạn số lần gọi theo IP (ví dụ đặt hàng 5 lần / 10 phút).
- **Honeypot**: một ô nhập ẩn trong form. Người thật không thấy nên để trống, bot tự điền thì bị chặn.
- **Sanitize**: HTML do admin soạn được lọc lại, chỉ giữ thẻ an toàn, để không ai nhét mã độc vào bài viết.
- **Kiểm tra file ảnh bằng "chữ ký" bên trong file**, không tin đuôi file; ảnh được nén và xoá thông tin GPS.

### 5.7 Audit log (lịch sử chỉnh sửa)
Mọi lần thêm / sửa / xoá của admin được tự động ghi: ai, lúc nào, đổi trường nào, từ giá trị gì sang gì. Chỉ ADMIN xem được. Mật khẩu và khoá OTP không bao giờ ghi.

### 5.8 Migration (thay đổi cấu trúc database có kiểm soát)
Mỗi lần đổi cấu trúc bảng (ví dụ "bỏ chuyển khoản") là một **file migration** có thứ tự thời gian. Máy nào chạy dự án cũng áp lần lượt các file này nên database luôn khớp code.

### 5.9 Xem trước và sửa trực tiếp
Admin mở web khách trong một khung, rê chuột vào phần nào thì phần đó có viền đỏ, bấm đúp để mở trang sửa phần đó. Web và admin "nói chuyện" với nhau qua `postMessage`.

### 5.10 Chạy thật (deploy)
Đóng gói thành các container Docker. **Caddy** đứng ngoài làm cửa vào duy nhất: lo HTTPS tự động và chuyển yêu cầu đến đúng app. **Sentry** (tuỳ chọn) báo lỗi thật về cho dev mà không gửi dữ liệu khách.

---

## 6. Bảng tra từ khó

| Từ | Nghĩa dễ hiểu |
|---|---|
| **Frontend** | Phần người dùng nhìn thấy (web, admin) |
| **Backend** | Phần chạy phía sau (API) |
| **API** | "Cửa sổ" để app này nhờ app kia làm việc |
| **Route** | Một địa chỉ, như `/products` |
| **Endpoint** | Một cửa của API, như `POST /orders` |
| **Component** | Một mảnh giao diện dùng lại được (nút, thẻ sản phẩm) |
| **Server Action** | Hàm chạy trên máy chủ, được gọi từ nút bấm trên trang |
| **DTO** | "Mẫu đơn" quy định dữ liệu gửi lên phải có những gì |
| **Slug** | Tên rút gọn trong đường dẫn, như `xoai-cat-hoa-loc` |
| **Variant** | Quy cách của sản phẩm (500g, 1kg) |
| **COD** | Thanh toán khi nhận hàng |
| **Env / biến môi trường** | Cài đặt bí mật theo từng máy (mật khẩu DB, khoá…) |
| **Typecheck / lint** | Công cụ soát lỗi code trước khi chạy |

---

## 7. Tự thử để hiểu

1. Mở web (`localhost:3000`), thêm sản phẩm vào giỏ, đặt một đơn thử.
2. Mở admin (`localhost:3002`), xem đơn xuất hiện, bấm xác nhận.
3. Quay lại tab web, vào **Tra cứu đơn hàng** và xem trạng thái đổi.
4. Sửa giá một sản phẩm ở admin, nhìn web tự cập nhật.

Bốn bước này đi qua gần hết kiến trúc ở trên.
