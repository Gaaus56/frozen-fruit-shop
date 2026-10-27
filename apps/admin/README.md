# Trái Cây 28 — Trang quản trị

Next.js 16 (App Router, Server Actions) + React 19 + Tailwind CSS 4 + Tiptap 3 (soạn bài). Đây là workspace con của monorepo; chạy lệnh từ **thư mục gốc repo**.

## Chạy cục bộ

```bash
cp apps/admin/.env.example apps/admin/.env.local
npm run dev:admin        # http://localhost:3002 (cần API chạy ở :4000)
npm run admin:create     # lần đầu: tạo tài khoản ADMIN (theo ADMIN_EMAIL / ADMIN_PASSWORD trong apps/api/.env)
```

| Biến | Ý nghĩa |
|---|---|
| `API_URL` | URL của API, chỉ dùng phía server (Server Components / Actions) |
| `NEXT_PUBLIC_WEB_URL` | Web khách hàng, mở trong khung "Xem trước & sửa" |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_*` | (Tuỳ chọn) Theo dõi lỗi bằng Sentry |

## Chức năng

- **Đơn hàng:** danh sách, chi tiết, đổi trạng thái, nhập phí ship, thông báo đơn mới tức thời, **xuất Excel**.
- **Nội dung:** sản phẩm, danh mục, banner, khối trang chủ, trang, chính sách, bài viết (soạn thảo có nút, chia cột, chọn liên kết nội bộ), bình luận, liên hệ / báo giá.
- **Cài đặt cửa hàng**, xem trước và sửa trực tiếp trên web.
- **Tài khoản:** nhân viên với quyền theo mục, lịch sử chỉnh sửa, đổi mật khẩu.
- **Bảo mật:** xác thực 2 lớp (OTP qua app Authenticator, mã dự phòng). Thao tác nhạy cảm yêu cầu nhập lại OTP trong 10 phút gần nhất.

## Cấu trúc

```
src/
├── app/
│   ├── login/                  # đăng nhập (mật khẩu → OTP)
│   ├── (dashboard)/<mục>/      # page.tsx, actions.ts ("use server"), *-form.tsx
│   └── api/export/orders/      # tải file Excel đơn hàng
├── components/
│   ├── ui/                     # form, help (nút ?), unsaved-changes-guard, image-upload, status-page…
│   ├── editor/                 # Tiptap: nút, chia cột, LinkSelect
│   └── layout/                 # sidebar, hộp nhập OTP
├── lib/                        # api.ts (api, runAction), otp-*, upload-action
└── proxy.ts                    # chặn trang khi chưa đăng nhập
```

## Kiểm tra & build

```bash
npm run lint:admin
npx tsc --noEmit -p apps/admin
npm run build:admin
```

Deploy: Vercel, Root Directory `apps/admin`.
