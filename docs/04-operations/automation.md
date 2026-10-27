# Tự động hoá: email, Zalo xác nhận đơn, phí ship

Hướng dẫn **chưa làm** — mô tả các phương án, chi phí, việc cần chuẩn bị và cách gắn vào code hiện có, để chọn rồi triển khai. Số liệu giá lấy từ các trang tham khảo tháng 10/2026, **phải kiểm tra lại bảng giá chính thức** trước khi chốt.

Hiện trạng: khách đặt → admin nhận thông báo tức thời (âm "ting") → nhân viên **gọi điện** xác nhận và báo phí ship → nhập phí ship trong trang đơn. Khách tra trạng thái ở trang *Tra cứu đơn hàng*.

## 1. Kiến trúc chung (làm một lần, dùng cho cả email và Zalo)

```
OrdersService (tạo đơn / đổi trạng thái / nhập phí ship)
   └─ phát sự kiện "order.created", "order.status_changed"   ← đã có RealtimeService cho thông báo admin
        └─ NotificationService (mới, apps/api/src/notifications)
             ├─ EmailChannel  (Resend / Brevo / SMTP)
             ├─ ZaloChannel   (Zalo ZNS)
             └─ ghi bảng notification_logs (kênh, người nhận, mẫu, trạng thái, lỗi, số lần thử)
```

Nguyên tắc:
- **Không làm chậm / làm hỏng việc đặt hàng:** gửi sau khi đơn đã lưu, lỗi gửi chỉ ghi log + Sentry, không trả lỗi cho khách.
- **Thử lại** khi lỗi mạng (3 lần, cách 1 / 5 / 30 phút). Đơn giản nhất: bảng `notification_logs` + cron mỗi phút quét bản ghi `pending`. Lớn hơn: hàng đợi BullMQ + Redis.
- **Không gửi trùng:** khoá `(orderId, loại tin)` duy nhất.
- **Bật / tắt từng kênh và từng loại tin** trong *Thông tin cửa hàng* (ví dụ chỉ gửi khi xác nhận đơn và khi giao).
- Biến môi trường mới chỉ đặt trên máy chủ API, không bao giờ ở web.

## 2. Email

| | Resend (khuyên dùng) | Brevo | SMTP Gmail |
|---|---|---|---|
| Gói miễn phí | 3.000 email / tháng, tối đa 100 / ngày, 1 tên miền | ~300 email / ngày | ~500 / ngày, dễ bị chặn |
| Cần tên miền riêng | Có (khai báo SPF, DKIM) | Có | Không |
| Ghi chú | API đơn giản, SDK Node | Có cả SMS, marketing | Không hợp cho hệ thống, dễ vào spam |

**Chuẩn bị:** mua tên miền (ví dụ `traicay28.vn`) → đăng ký Resend → thêm bản ghi DNS (SPF, DKIM, DMARC) → gửi từ `donhang@traicay28.vn`.

**Nên gửi:**
1. **Cho cửa hàng** (luôn có email): "Đơn mới DH…" kèm danh sách món — dự phòng khi không mở trang quản trị.
2. **Cho khách** (khi khách nhập email — ô này không bắt buộc): đặt thành công kèm bill, đã xác nhận + phí ship + tổng tiền, đang giao, đã giao.
3. **Bảo mật cho chủ:** đăng nhập mới, đổi mật khẩu, tắt OTP (xem [security.md](../02-architecture/security.md#6-việc-nên-làm-tiếp-theo-thứ-tự-ưu-tiên)).

**Code:** `npm i resend` (API) → `EmailChannel.send({ to, subject, html })`; mẫu email viết bằng React Email hoặc HTML thuần, dùng lại `receiptContent()` của web để nội dung bill giống nhau. Biến môi trường: `RESEND_API_KEY`, `MAIL_FROM`, `SHOP_NOTIFY_EMAIL`.

**Ước lượng:** 1–1,5 ngày (khung NotificationService + 4 mẫu email + bật / tắt trong admin).

## 3. Zalo (tin ZNS — Zalo Notification Service)

Khách Việt đọc Zalo nhiều hơn email; ZNS gửi được tới **số điện thoại** khách nhập khi đặt, khách không cần quan tâm (follow) OA.

**Điều kiện:**
- **Zalo Official Account (OA) đã xác thực**, thông tin trùng giấy phép kinh doanh (hộ kinh doanh cần kiểm tra Zalo có chấp nhận loại giấy phép này không).
- Chỉ gửi cho người **đã có giao dịch và đã cung cấp số điện thoại** — đúng trường hợp đơn hàng.
- **Mẫu tin phải được Zalo duyệt trước** (vài ngày). Mẫu là khung cố định có biến: `Đơn {order_number} đã được xác nhận. Tổng tiền {total}, phí ship {fee}…`.
- Cần app trên Zalo for Developers để lấy access token; token hết hạn sau một thời gian ngắn → lưu refresh token và tự làm mới.

**Chi phí tham khảo** (chưa VAT, chỉ tính tin gửi thành công): khoảng **200 đ / tin** mẫu thông thường, ~300 đ cho mẫu xác thực / thanh toán; thêm nút / ảnh tính thêm. Ví dụ 300 đơn / tháng × 3 tin ≈ 900 tin ≈ **~180.000–270.000 đ / tháng**. Kiểm tra bảng giá chính thức ở trang Zalo (zalo.solutions / Zalo OA Manager).

**Nên gửi (3 mẫu):** đã xác nhận đơn + phí ship + tổng tiền · đang giao · đã giao (kèm link tra cứu / đánh giá).

**Code:** `ZaloChannel.send({ phone, templateId, params })` gọi API ZNS; số điện thoại đổi sang dạng `84xxxxxxxxx`. Biến môi trường: `ZALO_APP_ID`, `ZALO_APP_SECRET`, refresh token lưu trong DB (mã hoá như khoá OTP). Mỗi tin lưu `notification_logs` để đối soát hoá đơn Zalo.

**Ước lượng:** 1–2 ngày code + **thời gian chờ** xác thực OA và duyệt mẫu (thường vài ngày tới 1–2 tuần).

**Phương án rẻ hơn nếu chưa đủ điều kiện OA:** giữ gọi điện như hiện tại, thêm nút **"Nhắn Zalo cho khách"** trong trang đơn → mở `zalo.me/<sđt>` với nội dung soạn sẵn (mã đơn, phí ship, tổng tiền) để nhân viên bấm gửi. Miễn phí, làm trong 1–2 giờ.

## 4. Phí ship tự động

Hàng **đông lạnh** — đơn vị giao thường (GHN, GHTK, Viettel Post) không cam kết giữ lạnh. Cách hợp lý theo vùng:

| Vùng | Cách giao phù hợp | Tính phí |
|---|---|---|
| Nội thành Đà Nẵng | Shipper riêng / giao nhanh trong ngày (Ahamove, Grab, Lalamove) — thùng xốp + đá gel | Bảng phí theo nhóm phường / xã hoặc theo km |
| Tỉnh lân cận | Nhà xe / xe khách gửi hàng lạnh | Bảng phí theo tỉnh, nhân viên xác nhận |
| Tỉnh xa | Hãng có dịch vụ hàng lạnh, hoặc từ chối | Gọi báo giá |

### Phương án A — Bảng phí theo khu vực (khuyên làm trước)

- Admin *Thông tin cửa hàng* → **Phí giao hàng**: các khu vực do cửa hàng tự đặt (ví dụ "Gần cửa hàng", "Trung tâm", "Xa trung tâm", "Tỉnh khác"), mỗi khu vực gồm danh sách phường / xã + phí + **miễn phí từ X đồng** (dải chữ chạy mẫu đang quảng cáo "miễn phí nội thành từ 300.000đ").
- Trang thanh toán đổi ô địa chỉ tự do thành **chọn tỉnh / thành + phường / xã** (2 cấp, theo danh sách đơn vị hành chính sau sắp xếp năm 2025 — không còn cấp quận / huyện) + số nhà, đường; API tự tính phí, khách thấy **tổng tiền ngay** thay vì "cửa hàng báo khi xác nhận".
- Khu vực "Tỉnh khác" → phí để trống, vẫn gọi báo giá như hiện tại.
- Không phụ thuộc bên ngoài, không tốn phí. **Ước lượng:** 1,5–2 ngày.

### Phương án B — Nối API đơn vị vận chuyển

- **GHN** có API chính thức (developer.ghn.vn): tính phí theo tuyến + khối lượng + gói dịch vụ, thời gian giao dự kiến, tạo vận đơn, webhook cập nhật trạng thái. Xác thực bằng `Token` + `ShopId`, có môi trường thử (staging).
- **Ahamove** (giao nội thành nhanh): tích hợp qua phần mềm bán hàng đối tác hoặc liên hệ Ahamove để lấy API — chưa thấy tài liệu công khai.
- Luồng: chọn địa chỉ chuẩn (mã địa giới của hãng — kiểm tra hãng đã cập nhật theo địa giới mới chưa) → API báo phí → admin bấm **"Tạo vận đơn"** khi chuyển *Đang giao* → lưu mã vận đơn, webhook tự chuyển *Đã giao*.
- Cần: tài khoản doanh nghiệp với hãng, khối lượng sản phẩm đã có trong từng quy cách (trường "Khối lượng (g)").
- **Ước lượng:** 3–5 ngày cho một hãng.

**Đề xuất thứ tự:** (1) nút "Nhắn Zalo cho khách" → (2) bảng phí theo khu vực → (3) email cho cửa hàng + khách → (4) Zalo ZNS khi đã có OA xác thực → (5) API hãng vận chuyển khi lượng đơn tỉnh đủ lớn.

## Nguồn tham khảo

- Bảng giá ZNS (bên thứ ba, 2026): smsthuonghieu.com/gia-zns, oazns.vn/bang-gia-zns, zafago.com — điều kiện OA, duyệt mẫu.
- Resend: resend.com/pricing (free 3.000 / tháng, 100 / ngày).
- GHN: developer.ghn.vn (API phí & dịch vụ, Token + ShopId).
