# Tài liệu dự án — Trái Cây Đông Lạnh Đà Nẵng 28

Website bán trái cây đông lạnh gồm **website khách hàng**, **trang quản trị** và **backend API** dùng chung, đóng gói trong một monorepo.

> **Nguyên tắc:** tài liệu mô tả hệ thống *đang chạy*. Khi code và tài liệu lệch nhau, sửa tài liệu trong cùng PR với code.

## Bức tranh 1 phút

```
Khách / Chủ shop ──► Tên miền + DNS ──► VPS: Caddy (HTTPS)
                                          ├─► apps/web    :3000  Next.js  — website khách hàng
                                          ├─► apps/admin  :3002  Next.js  — trang quản trị
                                          └─► apps/api    :4000  NestJS   — nghiệp vụ, phân quyền
                                                    └─► PostgreSQL 16 + thư mục ảnh /uploads
```

Một website hoàn chỉnh = **Domain + DNS + Hosting + Frontend + Backend + Database + API + SSL**. Bảng dưới đối chiếu từng lớp với dự án:

| Lớp | Trong dự án này | Tài liệu |
|---|---|---|
| Domain / DNS | `<DOMAIN>`, `api.<DOMAIN>`, `admin.<DOMAIN>` trỏ về IP VPS | [deployment.md](04-operations/deployment.md) |
| Hosting / Server | 1 VPS Ubuntu, Docker Compose | [deployment.md](04-operations/deployment.md) |
| SSL / HTTPS | Caddy tự cấp chứng chỉ Let's Encrypt | [deployment.md](04-operations/deployment.md) |
| Frontend | `apps/web` (khách), `apps/admin` (quản trị) | [web.md](03-apps/web.md), [admin.md](03-apps/admin.md) |
| API | REST JSON + SSE realtime | [api.md](03-apps/api.md) |
| Backend | NestJS 12 + Prisma 6 | [api.md](03-apps/api.md) |
| Database | PostgreSQL 16 | [database.md](03-apps/database.md) |
| Hỗ trợ | Cache Next.js, rate limit, lưu ảnh trên đĩa, JWT | [system-overview.md](02-architecture/system-overview.md) |

## Mục lục

| # | Thư mục | Tài liệu | Trả lời câu hỏi |
|---|---|---|---|
| 1 | **[01-product/](01-product/)** | [overview.md](01-product/overview.md) | Dự án là gì, cho ai, giải quyết vấn đề gì? |
| | | [features.md](01-product/features.md) | Có những tính năng gì, cái nào xong / chưa? |
| | | [business-info.md](01-product/business-info.md) | Thông tin cửa hàng gốc (địa chỉ, hotline, chính sách đổi trả) |
| 2 | **[02-architecture/](02-architecture/)** | [system-overview.md](02-architecture/system-overview.md) | Hệ thống gồm những phần nào, nguyên tắc thiết kế? |
| | | [request-flows.md](02-architecture/request-flows.md) | Một yêu cầu đi qua những đâu? (xem SP, đặt hàng, admin, realtime) |
| | | [security.md](02-architecture/security.md) | Bảo vệ hệ thống thế nào? OTP, thao tác cần OTP, danh sách kỹ thuật bảo mật backend |
| | | [folder-structure.md](02-architecture/folder-structure.md) | Code đặt ở đâu, quy tắc thêm code? |
| 3 | **[03-apps/](03-apps/)** | [web.md](03-apps/web.md) | Website khách hàng: trang, giỏ hàng, lấy dữ liệu |
| | | [admin.md](03-apps/admin.md) | Trang quản trị: chức năng, phân quyền ADMIN/STAFF |
| | | [api.md](03-apps/api.md) | Danh sách endpoint, xác thực, mã lỗi |
| | | [database.md](03-apps/database.md) | Bảng, quan hệ, quy tắc toàn vẹn, migration |
| 4 | **[04-operations/](04-operations/)** | [local-development.md](04-operations/local-development.md) | Cài và chạy trên máy dev |
| | | [deployment.md](04-operations/deployment.md) | Đưa lên VPS: domain, DNS, HTTPS, Docker |
| | | [demo-deploy.md](04-operations/demo-deploy.md) | Deploy bản demo miễn phí cho khách xem (Vercel + Render + Neon), khởi tạo lại database sạch |
| | | [monitoring-and-backup.md](04-operations/monitoring-and-backup.md) | Log, giám sát (Sentry), nén ảnh, xuất Excel, sao lưu, khôi phục sự cố |
| | | [automation.md](04-operations/automation.md) | Hướng dẫn tự động gửi email, Zalo xác nhận đơn, tính phí ship (chưa làm — phương án, chi phí) |
| | | [ci-cd.md](04-operations/ci-cd.md) | Quy trình nhánh, PR, CI, phát hành |
| 5 | **[05-roadmap/](05-roadmap/)** | [roadmap.md](05-roadmap/roadmap.md) | **Kế hoạch tổng thể** — làm gì tiếp, theo thứ tự nào |
| | | [production-readiness.md](05-roadmap/production-readiness.md) | Checklist 13 lớp "full-stack production" — đã đủ chưa? |
| | | [decisions.md](05-roadmap/decisions.md) | Vì sao chọn công nghệ / cách làm hiện tại |
| | | [ai-features.md](05-roadmap/ai-features.md) | Đề xuất ứng dụng LLM (AI) cho admin và web |
| 6 | **[06-testing/](06-testing/)** | [README.md](06-testing/README.md) | Test khi nào, dữ liệu mẫu, cách ghi kết quả |
| | | [web.md](06-testing/web.md) · [admin.md](06-testing/admin.md) · [api.md](06-testing/api.md) | Kịch bản test từng trang, nút bấm, trường hợp lỗi |
| | | [e2e.md](06-testing/e2e.md) | Kịch bản xuyên suốt trước mỗi lần phát hành |
| | | [findings.md](06-testing/findings.md) | Lỗi / điểm lệch đang mở |
| | | [bug-log.md](06-testing/bug-log.md) | Lỗi đã gặp khi code: nguyên nhân, cách sửa, bài học |
| — | [archive/](archive/) | `plan-v0/` | Kế hoạch ban đầu (lỗi thời, chỉ để tham khảo lịch sử) |

## Đọc theo vai trò

| Bạn là | Đọc theo thứ tự |
|---|---|
| **Người mới vào dự án** | overview → system-overview → request-flows → local-development → folder-structure |
| **Dev frontend** | web.md / admin.md → request-flows → api.md |
| **Dev backend** | api.md → database.md → security.md |
| **Người triển khai / vận hành** | deployment → monitoring-and-backup → production-readiness |
| **Người kiểm thử** | 06-testing/README → e2e → web / admin / api |
| **Chủ dự án / lập kế hoạch** | overview → features → roadmap → production-readiness |

## Quy ước viết tài liệu

- Tiếng Việt, câu ngắn; tên file, biến, lệnh, đường dẫn để trong `code`.
- Mỗi file trả lời **một** câu hỏi (cột phải của mục lục). Không chép lại nội dung — liên kết sang file khác.
- Sơ đồ dùng Mermaid (GitHub tự hiển thị) hoặc khung ASCII.
- Trạng thái tính năng dùng thống nhất: ✅ xong · 🟡 đang làm / một phần · ⬜ chưa làm.
- Thêm một quyết định kỹ thuật lớn → ghi một mục trong [decisions.md](05-roadmap/decisions.md).
