# Kịch bản test — Backend API (`apps/api`)

Gọi thẳng API bằng `curl` để kiểm tra những gì giao diện **không** chặn được: validate phía server, phân quyền, rate limit, bảo mật. Đây là lớp bảo vệ thật — giao diện chỉ để tiện dùng. Các ca này viết sao cho chuyển được thành test e2e tự động (roadmap 2.4).

Danh sách endpoint đầy đủ: [api.md](../03-apps/api.md). Cột **KQ**: ✅ / ❌ / ⏭.

## 0. Chuẩn bị

Dùng Git Bash / terminal có `curl` và [`jq`](https://jqlang.org/).

```bash
API=http://localhost:4000
J='content-type: application/json'

login() { curl -s -X POST $API/auth/login -H "$J" -d "{\"email\":\"$1\",\"password\":\"$2\"}" | jq -r .accessToken; }
ADMIN=$(login admin@test.vn 'Admin@123456')
STAFF=$(login staff1@test.vn 'Staff@1234')
A="authorization: Bearer $ADMIN"
S="authorization: Bearer $STAFF"

# id quy cách để đặt hàng
V500=$(curl -s "$API/products/xoai-cat-cat-mieng" | jq -r '.variants[] | select(.packageSize=="500g") | .id')
```

Mẹo: thêm `-w ' %{http_code}\n'` vào lệnh `curl` để in mã HTTP; `-i` để xem header.

---

## 1. Chung

| ID | Kịch bản | Lệnh / dữ liệu | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-001 | Health | `curl $API/health` | 200 `{"status":"ok","time":…}` | P0 | |
| TC-API-002 | Health khi DB tắt | `npm run db:down` → gọi lại | 500, không treo; bật lại DB thì tự hồi phục | P1 | |
| TC-API-003 | Header bảo mật | `curl -i $API/health` | Có `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`; **không** có `X-Powered-By` | P1 | |
| TC-API-004 | CORS hợp lệ | `curl -i $API/settings -H 'Origin: http://localhost:3000'` | Có `Access-Control-Allow-Origin: http://localhost:3000` | P1 | |
| TC-API-005 | CORS lạ | `-H 'Origin: https://evil.com'` | **Không** có `Access-Control-Allow-Origin` | P0 | |
| TC-API-006 | Đường dẫn lạ | `curl $API/khongco` | 404 JSON | P2 | |
| TC-API-007 | JSON hỏng | `curl -X POST $API/orders/quote -H "$J" -d '{abc'` | 400, không lộ stack trace | P1 | |
| TC-API-008 | Body > 1 MB | Gửi JSON 2 MB tới `/orders/quote` | 413 | P1 | |
| TC-API-009 | Trường lạ bị từ chối | `POST /orders/quote` với `{"items":[…],"hack":1}` | 400 "property hack should not exist" | P0 | |
| TC-API-010 | Lỗi không lộ nội bộ | Gây lỗi DB bất kỳ (VD: P2003) | Thông báo tiếng Việt, không có câu SQL / đường dẫn file | P1 | |

## 2. Dữ liệu công khai

| ID | Kịch bản | Lệnh / dữ liệu | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-020 | Cài đặt | `GET /settings` | 200; DB chưa có cài đặt → trả thông tin mặc định | P1 | |
| TC-API-021 | Danh mục | `GET /categories` | Chỉ danh mục đang hiện; `productCount` chỉ đếm sản phẩm đang bán; không có C3 | P0 | |
| TC-API-022 | Sản phẩm | `GET /products` | Chỉ sản phẩm đang bán thuộc danh mục đang hiện (không P4, P5); quy cách ẩn không xuất hiện; ảnh là URL đầy đủ `http://localhost:4000/uploads/…` | P0 | |
| TC-API-023 | Lọc | `?category=<slug C1>`, `?featured=true`, `?wholesale=true`, `?q=xoai`, `?limit=1` | Đúng điều kiện | P1 | |
| TC-API-024 | Sắp xếp | `?sort=price_asc` / `price_desc` / `newest` | Đúng thứ tự (giá = quy cách rẻ nhất) | P1 | |
| TC-API-025 | Tham số sai | `?sort=abc`, `?limit=0`, `?limit=101`, `?featured=yes`, `?q=<101 ký tự>` | 400 | P2 | |
| TC-API-026 | Chi tiết | `GET /products/<slug P1>` | Có `relatedProducts` (cùng danh mục, không gồm chính nó) | P1 | |
| TC-API-027 | Chi tiết ẩn | `GET /products/<slug P4>`, `/products/<slug P5>`, `/products/khongco` | 404 "Không tìm thấy sản phẩm." | P0 | |
| TC-API-028 | Bài viết | `GET /posts`, `/posts?limit=51`, `/posts/<slug N2 hẹn giờ>`, `/posts/<slug N3 nháp>` | Chỉ bài đã đăng & tới giờ; limit 51 → 400; N2, N3 → 404 | P1 | |
| TC-API-029 | Banner, chính sách | `GET /banners`, `/policies`, `/policies/<slug POL2>` | Chỉ mục đang bật; POL2 → 404 | P1 | |
| TC-API-030 | Ảnh tĩnh | `curl -i $API/uploads/<đường dẫn ảnh>` | 200, `Cache-Control` dài hạn (max-age=31536000, immutable) | P2 | |
| TC-API-031 | Không liệt kê thư mục | `curl -i $API/uploads/` và `$API/uploads/2026/` | 404 | P1 | |
| TC-API-032 | Path traversal | `curl --path-as-is $API/uploads/../.env` và `$API/uploads/..%2f..%2fpackage.json` | 404 / 400, **không** trả nội dung file | P0 | |

## 3. Báo giá `POST /orders/quote`

```bash
curl -s -X POST $API/orders/quote -H "$J" -d "{\"items\":[{\"variantId\":\"$V500\",\"quantity\":2}]}" | jq
```

| ID | Kịch bản | Dữ liệu `items` | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-040 | Hợp lệ | P1 500g × 2 | `lines[0].unitPrice` = giá DB, `lineTotal` = giá × 2, `available: true`, `subtotal` đúng, `hasUnavailableItems: false` | P0 | |
| TC-API-041 | Gộp dòng trùng | 2 dòng cùng `variantId`, SL 1 và 2 | 1 dòng SL 3 | P1 | |
| TC-API-042 | Hết hàng | Quy cách P2 | `available: false`, `issue: "Hết hàng"`, không tính vào `subtotal`, `hasUnavailableItems: true` | P0 | |
| TC-API-043 | Ngừng bán | Quy cách P4, P5 (danh mục ẩn) | `issue: "Sản phẩm đã ngừng bán"` | P0 | |
| TC-API-044 | Không tồn tại | `variantId: "abc"` | Không có dòng nào cho id đó; `hasUnavailableItems: true` | P0 | |
| TC-API-045 | Giỏ rỗng | `[]` | 400 "Giỏ hàng đang trống" | P1 | |
| TC-API-046 | Số lượng sai | 0, −1, 1.5, 1000, `"2"` | 400 | P0 | |
| TC-API-047 | Quá 50 dòng | 51 dòng | 400 | P2 | |
| TC-API-048 | Gửi kèm giá | `{"variantId":…,"quantity":1,"price":1}` | 400 (trường lạ) — **không thể** ép giá | P0 | |
| TC-API-049 | Rate limit | 61 lần / 60 giây | Lần 61: 429 "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút." | P2 | |

## 4. Tạo đơn `POST /orders`

```bash
ORDER='{"items":[{"variantId":"'$V500'","quantity":2}],"customerName":"Nguyễn Văn A","customerPhone":"0905123456","customerEmail":"","shippingAddress":"12 Lê Duẩn, Hải Châu, Đà Nẵng","customerNote":"","paymentMethod":"cod","website":""}'
curl -s -X POST $API/orders -H "$J" -d "$ORDER" | jq
```

| ID | Kịch bản | Thay đổi so với `$ORDER` | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-060 | Hợp lệ | — | 201 `{orderNumber, total}`; `orderNumber` khớp `^DH\d{6}[A-HJ-NP-Z2-9]{4}$`; ngày trong mã theo giờ VN; DB: `status=pending`, `shippingFee=0`, `total=subtotal`, có 1 log "Khách đặt hàng qua website" | P0 | |
| TC-API-061 | Bản chụp | Sau khi tạo, đổi giá + tên P1, xoá P1 | Dòng đơn giữ tên/quy cách/giá cũ; `productId`, `variantId` thành `null` sau khi xoá | P0 | |
| TC-API-062 | Ép giá / tổng / trạng thái | Thêm `"total":1`, `"status":"delivered"`, `"shippingFee":0` | 400 trường lạ | P0 | |
| TC-API-063 | Có dòng hết hàng | Thêm quy cách P2 | 400 "Một số sản phẩm trong giỏ đã hết hàng hoặc ngừng bán. Vui lòng kiểm tra lại giỏ hàng."; không tạo đơn | P0 | |
| TC-API-064 | Chỉ có variant không tồn tại | `items: [{"variantId":"abc","quantity":1}]` | 400 như trên | P0 | |
| TC-API-065 | Họ tên | `""`, `"A"`, `"   "`, 101 ký tự | 400 "Vui lòng nhập họ tên người nhận" (101 ký tự: 400 độ dài) | P1 | |
| TC-API-066 | SĐT | Từng giá trị ở [README §3](README.md#dữ-liệu-nhập-dùng-chung) | Hợp lệ → 201 (DB lưu dạng chuẩn hoá); không hợp lệ → 400 "Số điện thoại không hợp lệ" | P0 | |
| TC-API-067 | Email | `""` → 201; `"abc@"` → 400 "Email không hợp lệ"; bỏ hẳn trường → 201 | | P1 | |
| TC-API-068 | Địa chỉ | 9 ký tự / 301 ký tự | 400 | P1 | |
| TC-API-069 | Ghi chú | 1001 ký tự | 400 | P2 | |
| TC-API-070 | Phương thức | `"momo"`, thiếu trường | 400 "Phương thức thanh toán không hợp lệ" | P1 | |
| TC-API-071 | Honeypot | `"website":"http://spam"` | 400 "Không thể tạo đơn hàng."; không có đơn | P1 | |
| TC-API-072 | Khoảng trắng thừa | Tên `"  Nguyễn Văn A  "` | Lưu đã cắt khoảng trắng | P2 | |
| TC-API-073 | Rate limit | 6 đơn / 10 phút cùng IP | Đơn 6: 429 | P0 | |
| TC-API-074 | IP sau proxy | Gửi kèm `X-Forwarded-For: 1.2.3.4` khi gọi thẳng (không qua Caddy) | Ghi nhận: với `trust proxy = 1`, khi gọi thẳng API khách có thể giả IP để né rate limit. Trên production API **không** mở ra ngoài trực tiếp — chỉ qua Caddy — nên kiểm tra lại ca này qua `https://api.<DOMAIN>` | P1 | |
| TC-API-075 | Gửi đồng thời | 5 request tạo đơn cùng lúc (`xargs -P5`) | Mỗi request 1 đơn, mã đơn khác nhau | P2 | |
| TC-API-076 | Realtime | Mở `curl -N -H "$A" $API/admin/events` song song rồi tạo đơn | Nhận sự kiện `order.created` kèm mã đơn, tên, tổng | P1 | |

## 5. Tra cứu `GET /orders/lookup`

| ID | Kịch bản | Tham số | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-090 | Đúng | `orderNumber=<mã>&phone=0905123456` | 200; **không** trả `internalNote`, `customerPhone`, `customerEmail`, id nội bộ | P0 | |
| TC-API-091 | Mã chữ thường, SĐT khác định dạng | `orderNumber=<mã thường>&phone=%2B84%20905%20123%20456` | 200 | P1 | |
| TC-API-092 | Sai SĐT / sai mã | | Cùng 404 "Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại." | P0 | |
| TC-API-093 | Thiếu tham số | Không có `phone` | 400 | P2 | |
| TC-API-094 | Rate limit | 21 lần / 60 giây | 429 | P1 | |

## 6. Liên hệ `POST /inquiries`

| ID | Kịch bản | Body | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-110 | Liên hệ hợp lệ | `{"type":"contact","name":"Lan","phone":"0905123456","message":"Hỏi giá","website":""}` | 201 `{"ok":true}`; DB có inquiry `status=new` | P0 | |
| TC-API-111 | Sỉ không nội dung | `type: wholesale`, có `phone`, không `message` | 201 | P1 | |
| TC-API-112 | Liên hệ không nội dung | `type: contact`, không `message` | 400 "Vui lòng nhập nội dung cần hỗ trợ." | P1 | |
| TC-API-113 | Không SĐT & email | | 400 "Vui lòng để lại số điện thoại hoặc email để cửa hàng liên hệ lại." | P1 | |
| TC-API-114 | Loại sai | `type: "spam"` | 400 | P2 | |
| TC-API-115 | Honeypot | `website: "x"` | 201 `{"ok":true}` nhưng **không** lưu DB | P1 | |
| TC-API-116 | Độ dài | name 101, company 151, quantity 101, message 3001 | 400 | P2 | |
| TC-API-117 | Rate limit | 6 lần / 10 phút | 429 | P1 | |

## 7. Xác thực

| ID | Kịch bản | Lệnh / dữ liệu | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-130 | Đăng nhập đúng | `POST /auth/login` | 201 `{accessToken, expiresAt, user:{id,email,name,role}}`; **không** có `passwordHash` | P0 | |
| TC-API-131 | Sai / không tồn tại | | 401 "Email hoặc mật khẩu không đúng." (giống nhau) | P0 | |
| TC-API-132 | Khoá 5 lần | Sai 5 lần → đúng | 401 "Tài khoản tạm khoá… Thử lại sau 15 phút." | P0 | |
| TC-API-133 | Rate limit | 11 lần / 60 giây | 429 | P1 | |
| TC-API-134 | Không token | `GET /auth/me` | 401 "Bạn cần đăng nhập để thực hiện thao tác này." | P0 | |
| TC-API-135 | Sai kiểu header | `authorization: Token abc`, `Bearer` (rỗng) | 401 | P1 | |
| TC-API-136 | Token giả / sửa | Đổi 1 ký tự phần payload; token ký bằng khoá khác; `alg: none` | 401 "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại." | P0 | |
| TC-API-137 | Token hết hạn | `JWT_EXPIRES_IN=10s`, đợi 15 giây | 401 | P1 | |
| TC-API-138 | Tài khoản bị khoá | ADMIN `PATCH /admin/users/<STAFF2> {"isActive":false}` → STAFF2 dùng token cũ | 401 "Phiên đăng nhập không còn hiệu lực…" | P0 | |
| TC-API-139 | Bị xoá | Xoá STAFF2 → dùng token cũ | 401 | P0 | |
| TC-API-140 | Sau đặt lại mật khẩu | ADMIN reset mật khẩu STAFF1 → token cũ của STAFF1 | 401 | P0 | |
| TC-API-141 | Đổi mật khẩu | `POST /auth/change-password` | Trả token mới dùng được ngay; token cũ 401 | P0 | |
| TC-API-142 | Đổi mật khẩu sai | Sai mật khẩu hiện tại / mới = cũ / mới 7 ký tự | 400 với thông báo tương ứng | P1 | |
| TC-API-143 | SSE admin bị thu hồi | Mở `curl -N -H "$S" $API/admin/events`; khoá STAFF1 | Luồng bị đóng trong ≤ 60 giây | P1 | |
| TC-API-144 | SSE admin không token | `curl -N $API/admin/events` | 401 | P0 | |

## 8. Phân quyền ADMIN / STAFF

Gọi từng endpoint với token STAFF (`-H "$S"`).

| ID | Endpoint | STAFF | ADMIN | Ưu tiên | KQ |
|---|---|:-:|:-:|:-:|:-:|
| TC-API-160 | `GET /admin/stats?days=30` | 403 "Tài khoản của bạn không có quyền truy cập chức năng này." | 200 | P0 | |
| TC-API-161 | `PUT /admin/settings` | 403 | 200 | P0 | |
| TC-API-162 | `GET /admin/settings` | 200 | 200 | P2 | |
| TC-API-163 | `GET /admin/users`, `POST /admin/users` | 403 | 200 / 201 | P0 | |
| TC-API-164 | `PATCH`, `DELETE /admin/users/:id`, `POST /admin/users/:id/reset-password` | 403 | 200 / 204 | P0 | |
| TC-API-165 | `/admin/orders`, `/admin/inquiries`, `/admin/products`, `/admin/categories`, `/admin/posts`, `/admin/banners`, `/admin/policies`, `/admin/uploads` | 2xx | 2xx | P1 | |
| TC-API-166 | ADMIN sửa / xoá / reset chính mình qua `/admin/users/<id ADMIN>` | — | 404 "Không tìm thấy tài khoản nhân viên." (API không bao giờ đụng tới ADMIN) | P0 | |
| TC-API-167 | Tạo ADMIN qua API | `POST /admin/users` kèm `"role":"ADMIN"` | 400 trường lạ; không có ADMIN thứ hai | P0 | |
| TC-API-168 | STAFF tự nâng quyền | STAFF `PATCH /admin/users/<id mình> {"role":"ADMIN"}` | 403 | P0 | |

## 9. Quản lý đơn `PATCH /admin/orders/:id`

### 9.1. Ma trận chuyển trạng thái

Tạo một đơn mới cho mỗi dòng, đưa về trạng thái ở cột "Từ", rồi gửi `{"status":"<tới>"}`.

| Từ \ Tới | pending | confirmed | packing | shipping | delivered | cancelled |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **pending** | 200 (không đổi) | ✅ 200 | ❌ 400 | ❌ 400 | ❌ 400 | ✅ 200 |
| **confirmed** | ❌ | 200 | ✅ | ✅ | ❌ | ✅ |
| **packing** | ❌ | ❌ | 200 | ✅ | ❌ | ✅ |
| **shipping** | ❌ | ❌ | ❌ | 200 | ✅ | ✅ |
| **delivered** | ❌ | ❌ | ❌ | ❌ | 200 | ❌ |
| **cancelled** | ❌ | ❌ | ❌ | ❌ | ❌ | 200 |

❌ = 400 "Không thể chuyển đơn hàng sang trạng thái này." Đường chéo: gửi lại trạng thái hiện tại → 200, **không** thêm log. Ghi KQ cho cả 36 ô (TC-API-180).

### 9.2. Tiền và trường khác
| ID | Kịch bản | Body | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-190 | Phí ship + giảm | `{"shippingFee":30000,"discount":10000}` | `total = subtotal + 30000 − 10000` | P0 | |
| TC-API-191 | Giảm = tổng | `discount = subtotal + shippingFee` | 200, total 0 | P2 | |
| TC-API-192 | Giảm > tổng | +1 | 400 "Giảm giá không được lớn hơn tổng tiền đơn hàng." | P0 | |
| TC-API-193 | Âm / lẻ / quá lớn | `shippingFee: -1`, `1.5`, `10000001`; `discount: 1000000001` | 400 | P1 | |
| TC-API-194 | Đơn đã kết thúc | Đơn delivered: `{"shippingFee":1}` | 400 "Đơn đã giao hoặc đã huỷ, không thể sửa phí vận chuyển/giảm giá." | P0 | |
| TC-API-195 | Đơn kết thúc vẫn đổi được thanh toán | Đơn delivered: `{"paymentStatus":"paid"}`, `{"internalNote":"x"}` | 200 | P1 | |
| TC-API-196 | Giá trị sai | `paymentStatus: "done"`, `status: "lost"` | 400 | P1 | |
| TC-API-197 | Không sửa được tiền hàng | `{"subtotal":1}`, `{"items":[]}`, `{"total":1}` | 400 trường lạ | P0 | |
| TC-API-198 | Log | Đổi trạng thái kèm `"note":"Đã gọi"` | Log mới: from, to, note, `changedBy` = tên người gọi | P1 | |
| TC-API-199 | Không tồn tại | `PATCH /admin/orders/abc` | 404 "Không tìm thấy đơn hàng." | P2 | |
| TC-API-200 | Lọc danh sách | `GET /admin/orders?status=pending&q=0905&from=2026-10-01&to=2026-10-31&page=2&pageSize=5` | Đúng điều kiện; `{items,total,page,pageSize}` | P1 | |
| TC-API-201 | Phân trang sai | `page=0`, `pageSize=101`, `from=hom-qua` | 400 | P2 | |

## 10. Sản phẩm, danh mục, nội dung (admin)

| ID | Kịch bản | Lệnh / dữ liệu | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-220 | Tạo sản phẩm tối thiểu | `{"name":"Test","categoryId":"<C1>","images":[],"variants":[{"packageSize":"500g","price":10000,"stockStatus":"in_stock"}]}` | 201; slug `test`; `isActive` mặc định true | P0 | |
| TC-API-221 | Thiếu quy cách | `variants: []` | 400 "Cần ít nhất một quy cách đóng gói" | P0 | |
| TC-API-222 | > 12 ảnh, > 20 quy cách | | 400 "Tối đa 12 ảnh cho một sản phẩm" / 400 | P1 | |
| TC-API-223 | Ảnh không hợp lệ | `images:[{"url":"javascript:alert(1)"}]`, `"../../etc/passwd"`, `"ftp://x"` | 400 "Đường dẫn ảnh không hợp lệ" | P0 | |
| TC-API-224 | Ảnh ngoài | `images:[{"url":"https://example.com/a.jpg"}]` | 201 (cho phép URL http(s)); ghi nhận: web chỉ hiển thị ảnh từ `/uploads` của API (`next/image` chặn tên miền khác) | P2 | |
| TC-API-225 | Danh mục sai | `categoryId: "abc"` | 400 "Danh mục không tồn tại." | P1 | |
| TC-API-226 | Quy cách trùng tên | 2 × `"500g"` | 400 "Các quy cách đóng gói không được trùng tên." | P1 | |
| TC-API-227 | Sửa quy cách của sản phẩm khác | `PATCH /admin/products/<P1>` với `variants:[{"id":"<id quy cách P2>",…}]` | 400 "Quy cách không thuộc sản phẩm này." | P0 | |
| TC-API-228 | Sửa / thêm / xoá quy cách | PATCH: 1 dòng có `id` (sửa), 1 dòng không `id` (thêm), bỏ 1 dòng cũ | Dòng có id giữ nguyên id; dòng mới có id mới; dòng bị bỏ bị xoá | P0 | |
| TC-API-229 | Giá gốc ≤ giá | `compareAtPrice: 5000, price: 10000` | Lưu `compareAtPrice = null` | P2 | |
| TC-API-230 | Slug / SKU trùng | | 409 thông báo tiếng Việt | P1 | |
| TC-API-231 | Slug sai mẫu | `"slug":"Xoai Cat"` | 400 "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang" | P2 | |
| TC-API-232 | Xoá danh mục còn sản phẩm | `DELETE /admin/categories/<C1>` | 409 "Danh mục còn N sản phẩm…" | P0 | |
| TC-API-233 | Bài viết hẹn giờ | `POST /admin/posts {"title":"T","publishedAt":"2099-01-01T00:00:00Z"}` | 201; `GET /posts` không có | P1 | |
| TC-API-234 | Ngày sai | `publishedAt: "mai"` | 400 "Ngày đăng không hợp lệ" | P2 | |
| TC-API-235 | Banner link | `linkUrl: "javascript:alert(1)"` | 400 "Liên kết phải bắt đầu bằng "/" hoặc http(s)://" | P0 | |
| TC-API-236 | Cài đặt | `PUT /admin/settings` với `phone:"abc"`, `facebookUrl:"facebook.com"`, `mapUrl:"javascript:x"` | 400 thông báo tương ứng | P1 | |
| TC-API-237 | Revalidate | Sửa sản phẩm khi web đang chạy | Log API không có lỗi "revalidate"; web thấy dữ liệu mới ngay | P1 | |

## 11. Tải ảnh `POST /admin/uploads`

```bash
curl -s -X POST $API/admin/uploads -H "$A" -F "file=@anh.jpg" | jq
```

| ID | Kịch bản | File | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-250 | JPG / PNG / WEBP / GIF | Ảnh thật | 201 `{url}` dạng `…/uploads/yyyy/mm/<24 ký tự hex>.<đuôi đúng định dạng thật>` | P0 | |
| TC-API-251 | Đuôi sai nhưng nội dung đúng | PNG đổi tên `.jpg` | 201, file lưu đuôi `.png` | P2 | |
| TC-API-252 | Giả mạo | `.txt`/`.html`/`.svg` đổi tên `.jpg` | 400 "Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF." | P0 | |
| TC-API-253 | > 5 MB | 6 MB | 413 (multer) hoặc 400 "Ảnh vượt quá dung lượng tối đa 5MB." | P0 | |
| TC-API-254 | Không có file / sai tên trường | `-F "anh=@a.jpg"` | 400 "Chưa chọn file ảnh." | P2 | |
| TC-API-255 | Nhiều file | `-F file=@a.jpg -F file=@b.jpg` | 400 / 413 (chỉ 1 file) | P2 | |
| TC-API-256 | Không đăng nhập | Bỏ header `$A` | 401 | P0 | |
| TC-API-257 | Rate limit | 61 lần / 60 giây | 429 | P2 | |

## 12. Realtime công khai `GET /events`

| ID | Kịch bản | Lệnh | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-270 | Nhận sự kiện | `curl -N $API/events`; admin sửa sản phẩm | `data: {"type":"changed","tags":["catalog"]}`; sửa bài viết → `content`; sửa cài đặt → `settings` | P1 | |
| TC-API-271 | Không lộ dữ liệu | Đặt hàng / gửi liên hệ khi đang nghe `/events` | **Không** có sự kiện nào (chỉ luồng admin mới có) | P0 | |
| TC-API-272 | Ping | Nghe 60 giây | Có `ping` khoảng mỗi 25 giây | P2 | |

## 13. Route xoá cache của web `POST {web}/api/revalidate`

| ID | Kịch bản | Lệnh | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-API-290 | Không khoá | `curl -X POST localhost:3000/api/revalidate -d '{"tags":["catalog"]}'` | 401 | P0 | |
| TC-API-291 | Sai khoá | `-H 'x-revalidate-secret: sai'` | 401 | P0 | |
| TC-API-292 | Đúng khoá | Khoá đúng, `{"tags":["catalog","hack"]}` | 200 `{"revalidated":true,"tags":["catalog"]}` (tag lạ bị bỏ) | P1 | |
| TC-API-293 | Web chưa cài khoá | Xoá `REVALIDATE_SECRET` ở web | Mọi request 401 (không mở cửa khi thiếu cấu hình) | P1 | |
