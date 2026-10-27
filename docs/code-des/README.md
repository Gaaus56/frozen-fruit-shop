# Mô tả code theo từng màn hình / module

Tài liệu giải thích **code đang làm gì**, đi từ thứ khách / admin nhìn thấy xuống file nào chịu trách nhiệm. Khác với [docs/03-apps](../03-apps/) (mô tả tổng quan từng app), mỗi file ở đây ứng với **một trang hoặc một module**, có phần **Code** liệt kê đường dẫn file.

Cập nhật theo code ngày 13/10/2026 (nhánh `admin`). Khi đổi tính năng, sửa đúng file tương ứng.

> **Mới làm quen, chưa biết code?** Đọc [beginner-guide.md](beginner-guide.md) trước: giải thích dự án, luồng chạy và các kỹ thuật bằng ví dụ đời thường.

## Cách đọc một file

1. Các khối giao diện / hành vi, đánh số theo thứ tự xuất hiện.
2. **Code** — file page, component, action, service tương ứng.
3. Liên kết sang phần liên quan ở web ↔ admin ↔ api.

## Mục lục

| Khu vực | Mục lục | Nội dung |
|---|---|---|
| Website khách (`apps/web`) | [web/README.md](web/README.md) | Trang chủ, sản phẩm, giỏ hàng, thanh toán, tra cứu đơn, tin tức… |
| Trang quản trị (`apps/admin`) | [admin/README.md](admin/README.md) | Tổng quan, đơn hàng, sản phẩm, nội dung web, tài khoản, lịch sử… |
| Backend (`apps/api`) | [api/README.md](api/README.md) | Từng module NestJS: auth, orders, products, content, realtime… |

## Quy ước đặt tên

- Thư mục theo app: `web/`, `admin/`, `api/`.
- File `kebab-case.md`, đặt theo **tên route hoặc module** (`product-detail.md`, `order-lookup.md`, `home-blocks.md`).
- `shared.md` — thành phần dùng chung của app; `README.md` — mục lục của thư mục.
- Mỗi file là một trang / module; form thêm + sửa gộp chung với trang danh sách.
