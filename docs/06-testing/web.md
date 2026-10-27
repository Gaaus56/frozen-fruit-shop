# Kịch bản test — Website khách hàng (`apps/web`)

Dữ liệu dùng chung (P1…P5, C1…C4, B1, N1…, POL1…): [README.md §3](README.md#3-dữ-liệu-chuẩn-bị). Trừ khi ghi khác, mở `http://localhost:3000` ở Chrome máy tính với giỏ hàng trống (DevTools → Application → Local Storage → xoá khoá `traicay28:cart:v2`).

Cột **Ưu tiên**: P0 chặn phát hành · P1 chính · P2 phụ. Cột **KQ**: ✅ / ❌ / ⏭.

---

## 1. Khung trang chung (header, menu, footer, nút liên hệ)

### 1.1. Dải chữ chạy và logo
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-001 | Dải chữ chạy có nội dung tự nhập | Admin bật dải chữ, nhập "Giảm 10% tuần này" → mở web | Dải đỏ trên cùng chạy chữ "Giảm 10% tuần này" | P2 | |
| TC-WEB-002 | Dải chữ chạy tự ghép | Bật dải chữ, để trống nội dung | Chạy chữ "Chào mừng bạn đến với {tên cửa hàng} — Hotline {giờ}: {SĐT định dạng} — {mốc}, {địa chỉ}" | P2 | |
| TC-WEB-003 | Tắt dải chữ | Admin bỏ chọn "Hiện dải chữ chạy" | Không còn dải đỏ; header không bị khoảng trống | P2 | |
| TC-WEB-004 | Bấm logo | Ở trang bất kỳ, bấm logo tròn xanh | Về trang chủ `/` | P1 | |
| TC-WEB-005 | Logo thu gọn khi cuộn | Cuộn xuống > 150 px | Header dính đầu trang, có bóng; logo nhỏ + tên cửa hàng hiện ở trái thanh menu; bấm vào về `/` | P2 | |
| TC-WEB-006 | Dải 4 cam kết (desktop) | Màn ≥ 1024 px | Hiện "Chuẩn VietGAP", "Không chất bảo quản", "Hút chân không"; ≥ 1280 px hiện thêm "Giao hàng lạnh toàn quốc" | P2 | |

### 1.2. Menu chính (desktop ≥ 1024 px)
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-010 | 5 mục menu | Bấm lần lượt Trang chủ, Sản phẩm, Giới thiệu, Tin tức, Liên hệ | Mở đúng `/`, `/products`, `/about`, `/news`, `/contact`; **không** còn mục Đặt hàng sỉ | P1 | |
| TC-WEB-011 | Đánh dấu mục đang xem | Mở `/products/{slug P1}` | Mục "Sản phẩm" đỏ + gạch chân; mục khác không | P2 | |
| TC-WEB-012 | Menu thả xuống danh mục | Rê chuột vào "Sản phẩm" | Hiện danh sách danh mục đang hiển thị (C1, C2, C4); **không** có C3 | P1 | |
| TC-WEB-013 | Chọn danh mục từ menu | Rê vào "Sản phẩm" → bấm "Xoài đông lạnh" | Mở `/products?category={slug C1}`; menu thả xuống đóng lại, không tự mở lại khi chuột còn ở đó | P1 | |
| TC-WEB-015 | Menu thả xuống Tin tức | Rê chuột vào "Tin tức" | Hiện Kiến thức, Tuyển dụng → mở `/news?type=kien-thuc`, `/news?type=tuyen-dung` | P1 | |
| TC-WEB-016 | Hiệu ứng menu thả xuống | Rê chuột vào / ra "Sản phẩm", "Tin tức" | Danh sách chảy xuống (~0,4 s) khi mở, cuộn lên khi rời chuột; không giật; bật "Giảm chuyển động" trong hệ điều hành thì hiện / ẩn tức thì | P2 | |
| TC-WEB-014 | Menu bằng bàn phím | Nhấn Tab tới "Sản phẩm" | Menu thả xuống hiện khi focus; Tab tiếp đi qua từng danh mục; Enter mở trang | P2 | |

### 1.3. Tìm kiếm
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-020 | Mở ô tìm | Bấm nút kính lúp | Ô tìm hiện dưới nút, con trỏ tự vào ô | P1 | |
| TC-WEB-021 | Tìm có dấu | Gõ "Xoài" → Enter | Mở `/products?q=Xo%C3%A0i`; thấy P1 (sản phẩm có "xoài" trong tên); ô tìm đóng và xoá chữ | P1 | |
| TC-WEB-022 | Tìm không dấu | Gõ "xoai cat" → bấm nút tìm đỏ | Thấy P1 (khớp theo slug không dấu) | P1 | |
| TC-WEB-023 | Tìm chữ hoa / thường | Gõ "XOÀI" | Kết quả như TC-WEB-021 | P2 | |
| TC-WEB-024 | Tìm rỗng | Mở ô tìm, không gõ → Enter | Về `/products` (tất cả sản phẩm) | P2 | |
| TC-WEB-025 | Chỉ gõ khoảng trắng | Gõ "   " → Enter | Như TC-WEB-024 | P2 | |
| TC-WEB-026 | Không có kết quả | Tìm "abcxyz" | Tiêu đề phụ "Kết quả tìm kiếm cho "abcxyz" — 0 sản phẩm"; lưới hiện "Không tìm thấy sản phẩm nào khớp với "abcxyz"." | P1 | |
| TC-WEB-027 | Không lộ sản phẩm ẩn | Tìm "Mãng cầu", rồi "Bơ sáp" | 0 kết quả (P4 ngừng bán, P5 thuộc danh mục ẩn) | P0 | |
| TC-WEB-028 | Đóng bằng Esc | Mở ô tìm, gõ chữ, nhấn Esc | Ô đóng, chữ bị xoá | P2 | |
| TC-WEB-029 | Đóng khi bấm ra ngoài | Mở ô tìm, bấm vào vùng trống | Ô đóng | P2 | |
| TC-WEB-030 | Bấm lại kính lúp | Mở ô tìm, bấm kính lúp lần nữa | Ô đóng, chữ bị xoá | P2 | |
| TC-WEB-031 | Ký tự đặc biệt | Tìm `<script>alert(1)</script>` và `%` và `'` | Không lỗi trang, không chạy script; chữ hiện nguyên văn trong tiêu đề kết quả | P1 | |
| TC-WEB-032 | Chuỗi rất dài | Tìm 150 ký tự | Trang không sập (API giới hạn 100 ký tự → web nhận lỗi và hiện danh sách rỗng); ghi lại hành vi thực tế | P2 | |

### 1.4. Giỏ hàng trên header
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-040 | Giỏ trống | Mở trang | Icon giỏ không có số | P2 | |
| TC-WEB-041 | Số trên icon = tổng số lượng | Thêm P1 500g × 2 và P1 1kg × 1 | Icon hiện **3** (tổng số lượng, không phải số dòng) | P1 | |
| TC-WEB-042 | Bấm icon giỏ | Bấm icon | Mở `/cart` | P1 | |

### 1.5. Thanh điều hướng dưới (điện thoại < 1024 px)
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-050 | Hiển thị | Mở web trên điện thoại | Thanh bo tròn ở đáy: Trang chủ, Sản phẩm, [nút liên hệ ở giữa], Giới thiệu, **Tin tức**; menu desktop ẩn | P1 | |
| TC-WEB-051 | Chuyển trang | Bấm từng mục | Mở đúng trang; mục đang xem đổi màu đỏ | P1 | |
| TC-WEB-052 | Không che nội dung | Cuộn tới cuối trang / chân trang, nút "Đặt hàng" ở checkout | Nội dung cuối và các nút không bị thanh dưới che mất | P1 | |

### 1.6. Nút liên hệ nổi
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-060 | Icon luân phiên | Quan sát nút đỏ 10 giây | Icon đổi luân phiên mỗi ~2 giây (Messenger, Zalo, SMS, Gọi); nút có hiệu ứng nhấp nháy | P2 | |
| TC-WEB-061 | Mở danh sách | Bấm nút | Hiện danh sách: Messenger, Zalo Shop, SMS, Gọi ngay; nút đổi thành dấu ✕ | P1 | |
| TC-WEB-062 | Messenger | Bấm "Messenger" | Mở link Facebook của cửa hàng ở **tab mới** | P1 | |
| TC-WEB-063 | Ẩn Messenger khi chưa có Facebook | Admin xoá link Facebook → tải lại web → mở danh sách | Không còn mục Messenger; icon luân phiên không có Messenger | P2 | |
| TC-WEB-064 | Zalo | Bấm "Zalo Shop" | Mở `https://zalo.me/{số zalo, chỉ chữ số}` ở tab mới; nếu admin để trống số Zalo thì dùng hotline | P1 | |
| TC-WEB-065 | SMS | Trên điện thoại, bấm "SMS" | Mở ứng dụng tin nhắn với số hotline | P2 | |
| TC-WEB-066 | Gọi ngay | Trên điện thoại, bấm "Gọi ngay" | Mở trình gọi điện với số hotline | P1 | |
| TC-WEB-069 | Hiệu ứng danh sách liên hệ | Bấm nút liên hệ, bấm lại để đóng | Danh sách mở từ dưới lên, các mục hiện lần lượt từ mục gần nút; đóng thì thu lại; khi đóng, các tab "Sản phẩm" / "Giới thiệu" cạnh nút vẫn bấm được và Tab bàn phím không đi vào danh sách ẩn | P1 | |
| TC-WEB-067 | Đóng | Bấm ✕ / nhấn Esc / bấm ra ngoài | Danh sách đóng (cả 3 cách) | P2 | |
| TC-WEB-068 | Vị trí | Desktop: góc phải dưới · điện thoại: giữa thanh điều hướng dưới | Không đè lên nút khác | P2 | |

### 1.7. Chân trang
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-070 | Cột danh mục | Bấm Tất cả sản phẩm, Giới thiệu, Tin tức, Tuyển dụng, Liên hệ, Tra cứu đơn hàng | Mở đúng trang (Tuyển dụng → `/news?type=tuyen-dung`) | P1 | |
| TC-WEB-071 | Cột chính sách | Có POL1 (hiện), POL2 (ẩn) | Chỉ có POL1; bấm → `/policies/{slug}` | P1 | |
| TC-WEB-072 | Chưa có chính sách | Tắt hết chính sách | Cột hiện "Đang cập nhật." | P2 | |
| TC-WEB-073 | Liên hệ | Bấm SĐT, email, Facebook, địa chỉ | `tel:`; `mailto:`; Facebook tab mới; địa chỉ mở Google Maps tab mới (nếu có link bản đồ, không thì là chữ thường) | P1 | |
| TC-WEB-074 | Dòng bản quyền | Xem cuối trang | "© {năm hiện tại} {tên cửa hàng}. MST {mã} — {ghi chú}. Bảo lưu mọi quyền."; không có MST thì bỏ phần MST | P2 | |
| TC-WEB-075 | Trường trống | Admin xoá email, Zalo, Facebook | Các dòng tương ứng biến mất, không còn nhãn rỗng | P2 | |

### 1.8. Trang 404
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-080 | Đường dẫn không tồn tại | Mở `/abc` | Trang 404 tiếng Việt, có header/footer, nút "Về trang chủ" và "Xem sản phẩm" hoạt động | P1 | |

---

## 2. Trang chủ `/`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-100 | Không có banner | Tắt cả B1, B2 | Không có khung banner; trang bắt đầu bằng khối giới thiệu | P1 | |
| TC-WEB-101 | Một banner | Chỉ bật B1 | Hiện B1, **không** có mũi tên, không có chấm chuyển | P2 | |
| TC-WEB-102 | Nhiều banner — tự chuyển | Bật B1, B2 | Thanh tiến trình chạy ở chấm đang chọn; hết thanh tự sang banner kế; sau banner cuối quay về banner đầu | P1 | |
| TC-WEB-103 | Mũi tên ‹ › | Bấm ‹ ở banner đầu; bấm › | ‹ ở banner đầu → banner cuối; › → banner kế | P1 | |
| TC-WEB-104 | Chấm chuyển | Bấm chấm thứ 2 | Chuyển tới B2; chấm thứ 2 dài ra | P2 | |
| TC-WEB-105 | Nội dung banner | Xem B1 | Tiêu đề, mô tả (ẩn trên điện thoại), nút "Mua ngay" → `/products` | P1 | |
| TC-WEB-106 | Banner không liên kết | Xem B2 | Không có nút, không có lớp tối phủ ảnh khi không có tiêu đề/mô tả | P2 | |
| TC-WEB-107 | Có liên kết nhưng để trống chữ nút | Sửa B1: xoá "Chữ trên nút" | Ghi lại hành vi: web đang hiện nút "Xem ngay" (xem [findings.md F-06](findings.md)) | P2 | |
| TC-WEB-108 | Tỉ lệ ảnh | Xem ở desktop và điện thoại | Desktop 21:8, điện thoại 16:9, không méo ảnh | P2 | |
| TC-WEB-110 | Khối giới thiệu | Bấm "Khám phá sản phẩm", "Tìm hiểu về chúng tôi" | Mở `/products`, `/about` | P1 | |
| TC-WEB-111 | Lưới danh mục | Xem khối "Chọn theo loại trái cây" | Chỉ có danh mục đang hiện **và có ≥ 1 sản phẩm đang bán** (C1, C2); không có C3, C4; hiện số sản phẩm | P1 | |
| TC-WEB-112 | Bấm danh mục | Bấm C1 | Mở `/products?category={slug C1}` | P1 | |
| TC-WEB-113 | Không có danh mục nào | DB chưa có danh mục | Khối danh mục ẩn | P2 | |
| TC-WEB-114 | Sản phẩm nổi bật | P1, P3 có cờ nổi bật | Tiêu đề "Được khách hàng yêu thích nhất", tối đa 8 sản phẩm, có P1, P3 | P1 | |
| TC-WEB-115 | Không có sản phẩm nổi bật | Bỏ cờ nổi bật ở mọi sản phẩm | Tiêu đề đổi "Sản phẩm mới", hiện 8 sản phẩm mới nhất | P1 | |
| TC-WEB-116 | "Xem tất cả sản phẩm" | Bấm nút | Mở `/products` | P2 | |
| TC-WEB-117 | Bài viết mới | Có N1, N2 (hẹn giờ), N3 (ẩn) | Chỉ hiện N1 (tối đa 3 bài); bấm → `/news/{slug}` | P1 | |
| TC-WEB-118 | DB rỗng | Database mới, chưa nhập gì | Trang chủ vẫn hiện (khối giới thiệu), không lỗi; thông tin cửa hàng lấy mặc định | P1 | |

---

## 3. Danh sách sản phẩm `/products`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-130 | Tất cả | Mở `/products` | Tiêu đề "Tất cả trái cây đông lạnh"; đếm "N sản phẩm"; có P1, P2, P3; **không** có P4, P5 | P0 | |
| TC-WEB-131 | Lọc danh mục | Bấm chip C1 | Chỉ sản phẩm C1; chip C1 đỏ; tiêu đề = tên danh mục; mô tả = mô tả danh mục (hoặc câu mặc định nếu trống) | P1 | |
| TC-WEB-132 | Bỏ lọc | Bấm chip "Tất cả" | Về tất cả sản phẩm, giữ nguyên `sort` và `q` đang có | P1 | |
| TC-WEB-133 | Danh mục ẩn qua URL | Mở `/products?category={slug C3}` | 0 sản phẩm, không lộ P5 | P0 | |
| TC-WEB-134 | Danh mục không tồn tại | Mở `/products?category=khong-co` | Không lỗi trang; 0 sản phẩm, thông báo "Chưa có sản phẩm nào trong mục này..." | P2 | |
| TC-WEB-135 | Sắp xếp Nổi bật (mặc định) | Bấm "Nổi bật" | URL không có `sort`; thứ tự theo "Thứ tự hiển thị" admin, rồi mới nhất | P2 | |
| TC-WEB-136 | Mới nhất | Bấm "Mới nhất" | `?sort=newest`; sản phẩm tạo sau đứng trước | P2 | |
| TC-WEB-137 | Giá thấp → cao | Bấm | `?sort=price_asc`; theo **giá quy cách rẻ nhất** của mỗi sản phẩm, tăng dần | P1 | |
| TC-WEB-138 | Giá cao → thấp | Bấm | Giảm dần | P1 | |
| TC-WEB-139 | Kết hợp | Chọn C1 → giá cao→thấp → tìm "xoai" | URL có cả `category`, `sort`, `q`; kết quả đúng cả 3 điều kiện; nút sắp xếp đang chọn tô đen | P1 | |
| TC-WEB-140 | `sort` sai | Mở `/products?sort=abc` | Coi như "Nổi bật", không lỗi | P2 | |
| TC-WEB-141 | Xoá từ khoá | Tìm "xoai" rồi bấm chip “xoai” × | Về danh sách theo danh mục / sắp xếp đang chọn, không còn `q` | P1 | |
| TC-WEB-142 | Danh mục chưa có sản phẩm | Có danh mục đang hiện nhưng 0 sản phẩm (C4) | Chip C4 **vẫn hiện** (admin tạo và không ẩn); bấm vào → khung "Chưa có sản phẩm nào trong mục này" + nút xem tất cả | P2 | |
| TC-WEB-143 | Khung chờ | Mạng chậm (Slow 3G), bấm đổi danh mục / sắp xếp | Hiện khung chờ (thẻ xám nhấp nháy, bo góc) thay vì đứng yên; mở trang chi tiết hiện khung chờ chi tiết | P2 | |
| TC-WEB-144 | Không có kết quả | Tìm "abcxyz" | Khung trắng bo góc, biểu tượng 🔍, gợi ý từ khoá, nút "Xem tất cả sản phẩm" | P2 | |

### 3.1. Thẻ sản phẩm
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-150 | Nhiều quy cách | Xem thẻ P1 | Nhãn "2 quy cách"; giá "Từ 85.000 ₫" kèm 100.000 ₫ gạch ngang và "-15%"; nhãn "Nổi bật" | P1 | |
| TC-WEB-151 | Một quy cách | Xem thẻ P2 | Nhãn "500g"; không có chữ "Từ" | P2 | |
| TC-WEB-152 | Giá "Từ" bỏ qua quy cách hết hàng | Xem thẻ P3 | "Từ 250.000 ₫" (quy cách 2kg hết hàng không tính) | P1 | |
| TC-WEB-153 | Hết hàng toàn bộ | Xem thẻ P2 | Nhãn "Hết hàng" (ưu tiên hơn "Nổi bật"); nút + mờ, bấm không có tác dụng | P0 | |
| TC-WEB-154 | Thêm nhanh | Bấm + trên thẻ P1 | Thêm **quy cách rẻ nhất còn hàng** (500g) × 1; nút đổi ✓ ~1,5 giây; icon giỏ +1; **không** chuyển sang trang chi tiết | P0 | |
| TC-WEB-155 | Thêm nhanh nhiều lần | Bấm + trên P1 ba lần | Giỏ có 1 dòng P1 500g số lượng 3 | P1 | |
| TC-WEB-156 | Bấm thẻ | Bấm vào ảnh / tên | Mở `/products/{slug}` | P1 | |
| TC-WEB-157 | Không có ảnh | Xem thẻ P3 | Ảnh giữ chỗ (placeholder), không vỡ khung | P2 | |
| TC-WEB-158 | Tên dài | Sản phẩm tên 200 ký tự | Tên cắt 2 dòng, thẻ không vỡ bố cục | P2 | |

---

## 4. Chi tiết sản phẩm `/products/[slug]`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-170 | Breadcrumb | Mở P1, bấm "Sản phẩm" rồi tên danh mục | Mở `/products`, rồi `/products?category={slug C1}` | P2 | |
| TC-WEB-171 | Tiêu đề tab | Xem tab trình duyệt | Tên sản phẩm; chia sẻ link lên Zalo/Facebook hiện ảnh đầu tiên | P2 | |
| TC-WEB-172 | Thư viện ảnh | P1 có 3 ảnh: bấm ảnh nhỏ thứ 2, 3 | Ảnh lớn đổi theo; ảnh nhỏ đang chọn có viền đỏ | P1 | |
| TC-WEB-173 | Một ảnh / không ảnh | Mở P2 (1 ảnh), P3 (0 ảnh) | P2: không có dải ảnh nhỏ. P3: ảnh giữ chỗ | P2 | |
| TC-WEB-174 | Quy cách mặc định | Mở P3 (1kg sắp hết, 2kg hết) | Chọn sẵn 1kg (quy cách **đầu tiên còn hàng**) | P1 | |
| TC-WEB-175 | Đổi quy cách | Ở P1 bấm "1kg" | Nút 1kg đỏ; giá 160.000 ₫, không gạch ngang; "(160.000 ₫/kg)" | P0 | |
| TC-WEB-176 | Giá gốc & % giảm | Ở P1 chọn 500g | 85.000 ₫, 100.000 ₫ gạch ngang, "-15%", "(170.000 ₫/kg)" | P0 | |
| TC-WEB-177 | Quy cách hết hàng | Ở P3 | Nút "2kg (hết)" mờ, không bấm được | P0 | |
| TC-WEB-178 | Sắp hết hàng | Ở P3 chọn 1kg | Dòng vàng "Sắp hết hàng — chỉ còn số lượng giới hạn"; vẫn mua được | P1 | |
| TC-WEB-179 | Tất cả quy cách hết | Mở P2 | Dòng đỏ "Quy cách này hiện đã hết hàng"; nút "Thêm vào giỏ hàng" và "Mua ngay" bị khoá | P0 | |
| TC-WEB-180 | Không có khối lượng | Quy cách không nhập khối lượng | Không hiện giá/kg | P2 | |
| TC-WEB-181 | Nút − ở 1 | Số lượng = 1 | Nút − mờ, bấm không giảm | P1 | |
| TC-WEB-182 | Nút + tới 99 | Bấm + liên tục | Dừng ở 99, nút + mờ | P1 | |
| TC-WEB-183 | Thêm vào giỏ | Chọn 500g, số lượng 3 → "Thêm vào giỏ hàng" | Nút đổi "Đã thêm vào giỏ ✓" ~2 giây; icon giỏ +3; ở lại trang | P0 | |
| TC-WEB-184 | Cộng dồn | Thêm tiếp 500g × 2 | Giỏ có 1 dòng 500g × 5 (không tách dòng) | P0 | |
| TC-WEB-185 | Trần 99 khi cộng dồn | Giỏ có 500g × 98 → thêm 5 | Dòng thành 99 (không vượt) | P1 | |
| TC-WEB-186 | Hai quy cách là hai dòng | Thêm 500g × 1 và 1kg × 1 | Giỏ có 2 dòng riêng | P1 | |
| TC-WEB-187 | Mua ngay | Chọn 1kg × 2 → "Mua ngay" | Thêm vào giỏ rồi chuyển tới `/cart` | P0 | |
| TC-WEB-188 | Không còn link sỉ | Mở P3, P6 | Không có dòng "Gửi yêu cầu báo giá sỉ" | P2 | |
| TC-WEB-189 | Thông số bảo quản | Nhập đủ / thiếu từng trường ở admin | Chỉ hiện dòng có dữ liệu: Danh mục, Bảo quản, Hạn sử dụng "N ngày kể từ ngày sản xuất", Rã đông | P1 | |
| TC-WEB-190 | Mô tả chi tiết | Mô tả có nhiều dòng | Giữ nguyên xuống dòng; không có mô tả → khối ẩn | P2 | |
| TC-WEB-191 | Sản phẩm cùng loại | Mở P1 | Khối "Sản phẩm cùng loại" chỉ có sản phẩm cùng danh mục, đang bán, không gồm chính P1 | P2 | |
| TC-WEB-192 | Slug không tồn tại | Mở `/products/khong-co` | Trang 404; tiêu đề tab "Không tìm thấy sản phẩm" | P1 | |
| TC-WEB-193 | Sản phẩm ngừng bán / danh mục ẩn | Mở slug của P4, P5 | 404 | P0 | |
| TC-WEB-194 | Mã HTML trong mô tả | Admin nhập `<b>đậm</b><script>alert(1)</script>` vào mô tả | Hiện nguyên văn dạng chữ, không chạy script | P0 | |

---

## 5. Giỏ hàng `/cart`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-210 | Giỏ trống | Mở `/cart` khi giỏ trống | 🛒 "Giỏ hàng của bạn đang trống", nút "Xem sản phẩm" → `/products` | P1 | |
| TC-WEB-211 | Hiển thị dòng | Thêm P1 500g × 2, P1 1kg × 1 | Tiêu đề "Giỏ hàng (2 sản phẩm)"; mỗi dòng: ảnh, tên (link về trang sản phẩm), "Quy cách: …", đơn giá | P1 | |
| TC-WEB-212 | Tạm tính | Như trên | Tạm tính = 85.000×2 + 160.000 = **330.000 ₫**; "Phí vận chuyển: Cửa hàng báo khi xác nhận"; Tổng cộng = 330.000 ₫ | P0 | |
| TC-WEB-213 | Tăng số lượng | Bấm + | Số lượng +1, tạm tính cập nhật ngay; dừng ở 99 | P1 | |
| TC-WEB-214 | Giảm số lượng | Số lượng 2 → bấm − | Còn 1 | P1 | |
| TC-WEB-215 | Giảm từ 1 | Số lượng 1 → bấm − | Dòng **bị xoá khỏi giỏ ngay**, không hỏi lại (ghi nhận hành vi — [findings.md F-04](findings.md)) | P1 | |
| TC-WEB-216 | Xoá dòng | Bấm "Xóa" | Dòng biến mất; xoá dòng cuối → hiện trạng thái giỏ trống | P1 | |
| TC-WEB-217 | Lưu sau khi tải lại | Thêm hàng → F5 / đóng mở trình duyệt | Giỏ còn nguyên; thoáng thấy "Đang tải giỏ hàng..." trước khi hiện (không nhấp nháy "giỏ trống") | P0 | |
| TC-WEB-218 | Hai tab | Mở 2 tab, thêm hàng ở tab 1 | Tab 2 chưa cập nhật cho tới khi tải lại (ghi nhận) | P2 | |
| TC-WEB-219 | Chế độ ẩn danh / chặn lưu trữ | Mở Safari riêng tư hoặc chặn cookie/site data | Vẫn thêm và đặt hàng được trong phiên; tải lại thì giỏ trống, không lỗi | P2 | |
| TC-WEB-220 | Nút điều hướng | "Tiến hành thanh toán", "Tiếp tục mua sắm" | Mở `/checkout`, `/products` | P1 | |
| TC-WEB-221 | Giá cũ trong giỏ | Thêm P1 500g → admin đổi giá thành 90.000 → tải lại `/cart` | Ghi nhận: `/cart` vẫn hiện giá lúc thêm (85.000) cho tới khi vào `/checkout` (xem [findings.md F-03](findings.md)) | P1 | |
| TC-WEB-222 | Dữ liệu giỏ hỏng | Sửa localStorage `traicay28:cart:v2` thành `abc` → tải lại | Không sập trang; giỏ trống | P2 | |

---

## 6. Thanh toán `/checkout`

### 6.1. Báo giá
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-240 | Giỏ trống | Mở `/checkout` khi giỏ trống | "Giỏ hàng đang trống", nút "Xem sản phẩm" | P1 | |
| TC-WEB-241 | Đang kiểm tra | Mở với giỏ có hàng (mạng chậm: DevTools → Slow 3G) | "Đang kiểm tra giá và tình trạng hàng..."; nút "Đặt hàng" khoá | P1 | |
| TC-WEB-242 | Báo giá đúng | Giỏ: P1 500g × 2, P1 1kg × 1 | Danh sách "{quy cách} × {SL}", thành tiền từng dòng; Tạm tính = Tổng tạm tính = 330.000 ₫ | P0 | |
| TC-WEB-243 | Giá đổi so với lúc thêm | Thêm P1 500g, admin đổi giá 90.000, mở checkout | Hiện 90.000 ₫; giỏ hàng cũng cập nhật theo giá mới | P0 | |
| TC-WEB-244 | Dòng hết hàng | Thêm P3 1kg, admin đặt 1kg "Hết hàng", mở checkout | Dòng P3 có chữ đỏ "Hết hàng", thành tiền gạch ngang và không tính vào tạm tính; khung đỏ "Một số sản phẩm đã hết hàng hoặc ngừng bán. Quay lại giỏ hàng để bỏ chúng trước khi đặt."; nút "Đặt hàng" khoá | P0 | |
| TC-WEB-245 | Dòng ngừng bán | Thêm P1, admin tắt "Đang bán" P1 (hoặc ẩn danh mục C1) | Dòng có "Sản phẩm đã ngừng bán"; nút khoá | P0 | |
| TC-WEB-246 | Quy cách bị xoá | Thêm P1 1kg, admin xoá quy cách 1kg | Dòng 1kg tự biến mất khỏi giỏ (không báo); các dòng còn lại đặt được (ghi nhận — [findings.md F-05](findings.md)) | P1 | |
| TC-WEB-247 | Link "Quay lại giỏ hàng" | Ở TC-WEB-244 bấm link | Mở `/cart`; xoá dòng lỗi → quay lại checkout đặt được | P1 | |
| TC-WEB-248 | API tắt | Tắt API → mở checkout | Khung đỏ "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại."; nút khoá | P1 | |
| TC-WEB-249 | Đổi giá khi đang điền form | Đang ở checkout, admin đổi giá P1 | Trong ~2 giây tạm tính tự cập nhật, chữ đã nhập trong form **giữ nguyên** | P0 | |

### 6.2. Form thông tin
| ID | Kịch bản | Dữ liệu | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-260 | Bỏ trống bắt buộc | Bấm "Đặt hàng" khi trống Họ tên / SĐT / Địa chỉ | Trình duyệt báo ô bắt buộc, không gửi | P0 | |
| TC-WEB-261 | Họ tên 1 ký tự | "A" | Trình duyệt báo tối thiểu 2 ký tự | P1 | |
| TC-WEB-262 | Họ tên toàn khoảng trắng | "   " (3 dấu cách) | API báo "Vui lòng nhập họ tên người nhận" (khung đỏ dưới nút) | P1 | |
| TC-WEB-263 | SĐT hợp lệ | Lần lượt từng SĐT hợp lệ ở [README §3](README.md#dữ-liệu-nhập-dùng-chung) | Đặt được; admin thấy SĐT đã chuẩn hoá | P0 | |
| TC-WEB-264 | SĐT không hợp lệ | Lần lượt từng SĐT không hợp lệ | Khung đỏ "Số điện thoại không hợp lệ"; dữ liệu đã nhập còn nguyên | P0 | |
| TC-WEB-265 | Email trống | Để trống | Đặt được | P1 | |
| TC-WEB-266 | Email sai | `khach@` | Trình duyệt báo sai định dạng | P1 | |
| TC-WEB-267 | Địa chỉ ngắn | "Đà Nẵng" | Trình duyệt báo tối thiểu 10 ký tự | P1 | |
| TC-WEB-268 | Địa chỉ dài | 301 ký tự (dán) | Ô chỉ nhận 300 ký tự | P2 | |
| TC-WEB-269 | Ghi chú | 1000 ký tự, có xuống dòng, emoji | Đặt được; admin thấy nguyên văn | P2 | |
| TC-WEB-270 | Mã HTML | Họ tên `<img src=x onerror=alert(1)>` | Đặt được; admin hiện nguyên văn dạng chữ, không chạy script | P0 | |
| TC-WEB-271 | Chọn thanh toán | Bấm "Chuyển khoản ngân hàng" rồi "COD" | Ô được chọn có viền đỏ; mặc định là COD | P1 | Đã bỏ (chỉ còn COD từ 13/10/2026) |
### 6.3. Gửi đơn
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-280 | Đặt COD thành công | Điền hợp lệ, COD → "Đặt hàng" | Nút "Đang đặt hàng..." và khoá; sau đó màn hình ✅ "Đặt hàng thành công!", mã đơn dạng `DH{yyMMdd}{4 ký tự}`, tạm tính đúng; giỏ trống; icon giỏ hết số; cuộn lên đầu | P0 | |
| TC-WEB-281 | Đặt chuyển khoản | Như trên, chọn chuyển khoản | Thêm khung "Hướng dẫn chuyển khoản" = nội dung "Thông tin chuyển khoản" trong cài đặt (giữ xuống dòng) | P0 | Đã bỏ (chỉ còn COD từ 13/10/2026) |
| TC-WEB-282 | Chuyển khoản khi chưa cài thông tin | Xoá thông tin chuyển khoản ở admin → đặt CK | Khung hiện "Cửa hàng sẽ gửi thông tin chuyển khoản khi gọi xác nhận đơn. Nội dung chuyển khoản: {mã đơn}." | P1 | Đã bỏ (chỉ còn COD từ 13/10/2026) |
| TC-WEB-283 | Link sau khi đặt | Bấm "tra cứu tình trạng đơn hàng", "Tiếp tục mua sắm" | Mở `/order-lookup`, `/products`; hotline hiện đúng định dạng | P1 | |
| TC-WEB-284 | Bấm "Đặt hàng" 2 lần nhanh | Nhấp đúp | Chỉ tạo **1** đơn | P0 | |
| TC-WEB-285 | Hàng hết đúng lúc bấm đặt | Mở checkout, admin đặt P1 500g hết hàng (API tắt realtime nếu cần), bấm "Đặt hàng" | Khung đỏ "Một số sản phẩm trong giỏ đã hết hàng hoặc ngừng bán. Vui lòng kiểm tra lại giỏ hàng."; không tạo đơn | P0 | |
| TC-WEB-286 | Quá giới hạn đặt hàng | Đặt 6 đơn trong 10 phút từ cùng máy | Đơn thứ 6: "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút." | P1 | |
| TC-WEB-287 | Mất mạng khi gửi | DevTools → Offline → "Đặt hàng" | "Không kết nối được máy chủ…"; nút mở lại; giỏ và form còn nguyên | P1 | |
| TC-WEB-288 | Bot điền ô ẩn | DevTools: điền `website` = "x" → đặt | Khung đỏ "Không thể tạo đơn hàng."; không có đơn mới ở admin | P1 | |
| TC-WEB-289 | Admin nhận đơn | Giữ admin mở ở `/orders` khi đặt | Admin hiện thông báo + âm báo "Đơn hàng mới {mã}" (xem [admin.md §12](admin.md#12-realtime)) | P0 | |

---

## 7. Tra cứu đơn `/order-lookup`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-300 | Tra đúng | Nhập mã + SĐT của đơn vừa đặt | Nút "Đang tra cứu..."; hiện "Đơn {mã}", "Đặt ngày …", thanh tiến trình 5 bước tới "Chờ xác nhận", danh sách hàng, tạm tính, "Phí vận chuyển: Chờ cửa hàng xác nhận", tổng, "Thanh toán khi nhận hàng — Chưa thanh toán", người nhận + địa chỉ | P0 | |
| TC-WEB-301 | Mã chữ thường | Nhập mã viết thường | Tự đổi chữ hoa, tra được | P1 | |
| TC-WEB-302 | SĐT khác định dạng | Đặt bằng `0905123456`, tra bằng `+84 905 123 456` | Tra được | P1 | |
| TC-WEB-303 | Sai SĐT | Mã đúng, SĐT khác | "Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại." | P0 | |
| TC-WEB-304 | Sai mã | Mã không tồn tại, SĐT đúng | **Cùng** thông báo như TC-WEB-303 (không lộ mã nào tồn tại) | P0 | |
| TC-WEB-305 | SĐT sai định dạng | `12345` | "Số điện thoại không hợp lệ" | P1 | |
| TC-WEB-306 | Mã quá ngắn | `DH1` | Trình duyệt báo tối thiểu 4 ký tự | P2 | |
| TC-WEB-307 | Sau khi xác nhận | Admin xác nhận đơn, nhập phí ship 30.000, giảm 10.000 → tra lại | Thanh tiến trình tới "Đã xác nhận"; phí ship 30.000; dòng "Giảm giá -10.000"; tổng = tạm tính + 30.000 − 10.000 | P0 | |
| TC-WEB-308 | Các trạng thái | Chuyển đơn qua đóng gói → đang giao → đã giao | Thanh tiến trình tô tới đúng bước | P1 | |
| TC-WEB-309 | Đơn huỷ | Admin huỷ đơn | Chữ đỏ "Đơn hàng đã bị huỷ." thay cho thanh tiến trình | P1 | |
| TC-WEB-310 | Đã thanh toán | Admin đổi thanh toán "Đã thanh toán" | Dòng thanh toán đổi tương ứng | P1 | |
| TC-WEB-311 | Sản phẩm đã đổi tên / xoá | Admin đổi tên P1 rồi xoá P1 → tra đơn cũ | Đơn vẫn hiện tên, quy cách, giá **lúc đặt** | P0 | |
| TC-WEB-312 | Dò mã | Tra 21 lần trong 1 phút | Lần 21: "Bạn thao tác quá nhanh…" | P1 | |

---

## 8. Liên hệ `/contact`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-330 | Thông tin | Mở trang | Hotline (kèm giờ), Zalo (tab mới), email (`mailto:`), Facebook (tab mới), địa chỉ, mốc, link bản đồ (tab mới), MST; trường trống thì ẩn | P1 | |
| TC-WEB-331 | Gửi hợp lệ | Họ tên + SĐT + nội dung → "Gửi liên hệ" | Nút "Đang gửi..."; form thay bằng "Cảm ơn bạn đã liên hệ! …"; admin có liên hệ mới loại "Liên hệ" | P0 | |
| TC-WEB-332 | Chỉ email | Họ tên + email + nội dung | Gửi được | P1 | |
| TC-WEB-333 | Không SĐT, không email | Họ tên + nội dung | Khung đỏ "Vui lòng để lại số điện thoại hoặc email để cửa hàng liên hệ lại." | P1 | |
| TC-WEB-334 | Thiếu nội dung | Bỏ trống nội dung | Trình duyệt báo bắt buộc | P1 | |
| TC-WEB-335 | Nội dung toàn khoảng trắng | "   " | "Vui lòng nhập nội dung cần hỗ trợ." | P2 | |
| TC-WEB-336 | SĐT / email sai | `12345` / `abc@` | "Số điện thoại không hợp lệ" / trình duyệt báo email sai | P1 | |
| TC-WEB-337 | Họ tên 1 ký tự | "A" | Trình duyệt báo tối thiểu 2 ký tự | P2 | |
| TC-WEB-338 | Gửi quá nhiều | Gửi form liên hệ 6 lần trong 10 phút | Lần 6: "Bạn thao tác quá nhanh…" | P1 | |
| TC-WEB-339 | Bot | Điền ô ẩn `website` | Vẫn hiện "Cảm ơn…" nhưng admin **không** có liên hệ mới | P1 | |

## 9. Trang đã bỏ

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-350 | Trang sỉ đã bỏ | Mở `/wholesale` | Trang 404; không còn link nào trên web dẫn tới đây | P1 | |

## 10. Tin tức, chính sách, giới thiệu

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-370 | Danh sách tin | Mở `/news` | Tab "Tất cả" đang chọn; chỉ bài đã bật và tới ngày đăng, mới nhất trước; mỗi thẻ có nhãn loại (Kiến thức / Tuyển dụng), bài tuyển dụng có nhãn xanh trên ảnh | P1 | |
| TC-WEB-378 | Tab loại bài | Bấm "Kiến thức", "Tuyển dụng", "Tất cả" | URL `?type=kien-thuc` / `?type=tuyen-dung` / không có `type`; tiêu đề trang đổi theo; khi đã lọc thì thẻ không lặp nhãn loại | P1 | |
| TC-WEB-379 | Đầu trang Tin tức | Mở `/news` ở 375 px và 1440 px | Cùng kiểu với trang Sản phẩm: ảnh nền + lớp tối, tiêu đề trắng, chip bo tròn (đỏ = đang chọn); chip **không** dính khi cuộn; không bị logo che | P2 | |
| TC-WEB-380 | Chưa có tin tuyển dụng | Tắt mọi bài tuyển dụng → mở tab Tuyển dụng | "Hiện cửa hàng chưa có vị trí tuyển dụng…" kèm link Zalo | P2 | |
| TC-WEB-381 | Bài tuyển dụng | Mở một bài tuyển dụng | Nhãn "Tuyển dụng" trên tiêu đề; cuối bài có khối "Ứng tuyển": Nhắn Zalo (tab mới), Gọi (`tel:`), Gửi email (`mailto:` có sẵn tiêu đề "Ứng tuyển: …"; ẩn nếu chưa cài email) | P1 | |
| TC-WEB-382 | `type` sai | Mở `/news?type=abc` | Coi như "Tất cả", không lỗi | P2 | |
| TC-WEB-371 | Chưa có bài | Tắt mọi bài | "Chưa có bài viết nào. Vui lòng quay lại sau." | P2 | |
| TC-WEB-372 | Hẹn giờ đăng | Đặt N2 đăng sau 2 phút → đợi → tải lại | Trước giờ: không thấy, `/news/{slug N2}` 404. Sau giờ (≤ 5 phút do cache): thấy | P1 | |
| TC-WEB-373 | Chi tiết bài | Bấm N1 | Bài nằm trong khung trắng bo góc căn giữa trang; **không** có đường dẫn nhỏ (breadcrumb); nhãn loại (bấm được) trên tiêu đề; ngày đăng chữ thường màu xám ngay dưới tiêu đề; ảnh bìa; tóm tắt in đậm; ảnh trong bài căn giữa | P1 | |
| TC-WEB-374 | Bài ẩn / không tồn tại | Mở slug N3, slug sai | 404, tiêu đề tab "Không tìm thấy bài viết" | P1 | |
| TC-WEB-375 | Chính sách | Mở POL1 từ chân trang | Tiêu đề + nội dung giữ xuống dòng | P1 | |
| TC-WEB-376 | Chính sách ẩn | Mở `/policies/{slug POL2}` | 404 | P1 | |
| TC-WEB-377 | Giới thiệu | Mở `/about` | Tiêu đề, dòng giới thiệu, nội dung theo "Trang Giới thiệu" của admin; ảnh không vỡ, link hoạt động | P1 | |
| TC-WEB-383 | Nội dung có định dạng | Mở bài có tiêu đề, đậm, danh sách, trích dẫn, khung ghi chú, ảnh có chú thích, ô sản phẩm (375 px và 1440 px) | Hiển thị đúng kiểu; ảnh nhỏ không bị kéo giãn mờ, ảnh lớn co vừa khung; ô sản phẩm không gạch chân, bấm vào mở trang sản phẩm; không cuộn ngang | P0 | |
| TC-WEB-384 | Hàng sản phẩm tự lướt | Bài có 6 ô sản phẩm liền nhau và một hàng 2 ô; xem ở 1440 px và 375 px, đợi 6 giây | Mỗi hàng nằm trên **một dòng**; hàng 6 ô tự lướt sang 1 thẻ mỗi ~5 giây, chạy vòng không thấy giật lùi; vuốt tay được, chạm / giữ chuột thì dừng; hàng 2 ô đứng yên; thẻ cao bằng nhau; bật "Giảm chuyển động" thì không tự lướt | P1 | |
| TC-WEB-385 | Mục lục | Bài có ≥ 2 Tiêu đề / Tiêu đề nhỏ | Khung "Nội dung:" sau tóm tắt, đánh số 1, 1.1…; bấm mục → cuộn mượt, tiêu đề không bị header che, URL có `#muc-N`; nút bên phải thu gọn / mở; bài < 2 tiêu đề không có mục lục | P1 | |
| TC-WEB-386 | Xem thêm | Cuối bài | "Xem thêm:" tối đa 5 link bài khác (cùng loại trước), không có chính bài đang xem | P2 | |
| TC-WEB-387 | Gửi bình luận | Điền nội dung, tên, email → "Gửi bình luận" | Báo "đang chờ cửa hàng duyệt"; bình luận **chưa** hiện; admin có thông báo + số trên menu | P0 | |
| TC-WEB-388 | Kiểm tra form bình luận | Bỏ trống / tên 1 ký tự / email sai / nội dung 2 link / gửi 6 lần trong 10 phút / điền ô ẩn `website` | Trình duyệt chặn ô bắt buộc; "Email không hợp lệ"; "Bình luận chứa quá nhiều đường link."; lần 6: "Bạn thao tác quá nhanh…"; bot: báo thành công nhưng không lưu | P1 | |
| TC-WEB-389 | Lưu tên, email | Tích "Lưu tên và email…", gửi, tải lại trang | Tên và email điền sẵn; bỏ tích rồi gửi → lần sau không điền sẵn | P2 | |
| TC-WEB-390 | Hiện bình luận | Admin duyệt 1 bình luận, trả lời 1 bình luận | "2 bình luận", cũ trước mới sau; câu trả lời trong khung xanh "{tên cửa hàng} trả lời"; email người bình luận **không** xuất hiện ở đâu trên web | P0 | |

---

## 11. Cập nhật realtime

Mở web ở một cửa sổ, admin ở cửa sổ khác.

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-400 | Đổi giá | Web mở trang P1; admin đổi giá 500g → Lưu | Trong ~0,3–2 giây giá trên web đổi, **không** tải lại cả trang (không nháy trắng), giỏ hàng giữ nguyên | P0 | |
| TC-WEB-401 | Tắt sản phẩm | Web mở `/products`; admin tắt "Đang bán" P1 | P1 biến khỏi danh sách | P1 | |
| TC-WEB-402 | Banner / bài viết | Web mở trang chủ; admin thêm banner | Banner mới xuất hiện | P1 | |
| TC-WEB-403 | Thông tin cửa hàng | Admin đổi hotline | Header, footer, nút liên hệ đổi số | P1 | |
| TC-WEB-404 | Tab đang ẩn | Web chuyển sang tab khác; admin đổi giá; quay lại tab web | Cập nhật ngay khi quay lại | P2 | |
| TC-WEB-405 | Đang gõ form | Đang gõ dở form liên hệ; admin đổi dữ liệu | Chữ đang gõ không mất | P1 | |
| TC-WEB-406 | API khởi động lại | Tắt API 10 giây rồi bật | Web tự kết nối lại và tải dữ liệu một lần; không báo lỗi cho khách | P2 | |
| TC-WEB-407 | Không cấu hình revalidate | Xoá `WEB_REVALIDATE_URL` ở API → đổi giá | Trang mở sẵn **không** đổi ngay; tối đa 5 phút sau tải lại thì thấy giá mới | P2 | |
| TC-WEB-408 | Nhiều tab | Mở 8 tab web, ở tab thứ 9 vào thanh toán | Báo giá giỏ hàng vẫn chạy ngay; chỉ 1 kết nối `/events` tới API cho cả trình duyệt; admin đổi giá → mọi tab cập nhật | P1 | |

## 12. Khi API lỗi

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-420 | API tắt | Tắt API, mở các trang (trang đã cache có thể vẫn hiện dữ liệu cũ — dùng `npm run build && start` hoặc chờ hết cache) | Trang vẫn hiện, không trắng / 500: thông tin cửa hàng mặc định, danh sách rỗng, sản phẩm chi tiết → 404 | P1 | |
| TC-WEB-421 | Ảnh sản phẩm mất | Xoá file ảnh trong `apps/api/uploads` | Khung ảnh lỗi không làm vỡ bố cục | P2 | |

## 13. Giao diện, trình duyệt, khả năng truy cập, SEO

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-WEB-440 | Không cuộn ngang | Mọi trang ở 320, 375, 768, 1024, 1440 px | Không có thanh cuộn ngang; chữ không tràn; nút đủ lớn để bấm (≥ 40 px) | P1 | |
| TC-WEB-441 | Safari iOS | Chạy E2E-01 trên iPhone | Đặt hàng được; ô nhập không tự phóng to làm vỡ bố cục; thanh dưới không che nút | P0 | |
| TC-WEB-442 | Bàn phím | Chỉ dùng Tab / Enter / Esc đi hết luồng xem → thêm giỏ → đặt hàng | Làm được; luôn thấy viền focus | P2 | |
| TC-WEB-443 | Trình đọc màn hình | Bật VoiceOver/TalkBack trên nút giỏ, nút liên hệ, nút số lượng | Đọc được nhãn: "Giỏ hàng", "Liên hệ", "Tăng số lượng"… | P2 | |
| TC-WEB-444 | Tiêu đề trang | Mở từng trang | Tab có tiêu đề riêng (Sản phẩm, Liên hệ, tên sản phẩm, tên bài…) | P2 | |
| TC-WEB-445 | Tốc độ | Lighthouse (mobile) trang chủ và P1 | Performance ≥ 70, LCP < 3 s trên 4G giả lập; ghi số liệu | P2 | |
| TC-WEB-446 | Font tiếng Việt | Xem các chữ có dấu: "Ưu đãi", "Huỷ", "Đ" | Hiển thị đúng, không lỗi font | P2 | |
