# Checklist sẵn sàng production

"Full-stack" không chỉ là frontend + backend. Một website bán hàng chạy thật cần đủ **13 lớp** dưới đây. Bảng đánh giá trạng thái dự án tại thời điểm cập nhật gần nhất (2026-10).

Trạng thái: ✅ đủ cho quy mô hiện tại · 🟡 có nhưng thiếu · ⬜ chưa có

| # | Lớp | Trạng thái | Đã có | Còn thiếu → việc trong [roadmap](roadmap.md) |
|---|---|:-:|---|---|
| 1 | **Frontend** | ✅ | Web khách + admin, Next.js SSR, responsive, tiêu đề / mô tả từng trang | `sitemap.xml`, `robots.txt`, JSON-LD (G1, G2) |
| 2 | **API & backend logic** | ✅ | REST NestJS, validate, báo giá phía server, trạng thái đơn chặt chẽ | Thông báo đơn mới ra ngoài (Telegram / email) (G2) |
| 3 | **Database & storage** | ✅ | PostgreSQL 16, migration Prisma, ràng buộc toàn vẹn, ảnh trên đĩa | Object storage cho ảnh khi cần CDN (G4) |
| 4 | **Auth & permissions** | 🟡 | JWT trong cookie httpOnly, ADMIN/STAFF kiểm tra ở API, khoá khi sai mật khẩu, thu hồi token khi đổi mật khẩu | OTP cho ADMIN (G2) |
| 5 | **Hosting & deployment** | 🟡 | Docker Compose + Dockerfile cho 3 app, hướng dẫn VPS | Chưa go-live; **lỗi `.gitignore` khiến build API từ bản clone bị hỏng** (G1) |
| 6 | **Cloud & compute** | 🟡 | Thiết kế cho 1 VPS 2 vCPU / 2 GB | Thuê VPS, swap, giới hạn log Docker (G1) |
| 7 | **CI/CD & version control** | 🟡 | Git + GitHub, PR, CI lint + build | Bảo vệ nhánh `main`, test tự động, lint API, tự triển khai (G1–G3) |
| 8 | **Security** | 🟡 | Header bảo mật ở API, CORS, honeypot, kiểm tra file tải lên, Postgres không mở ra ngoài | Header bảo mật cho web/admin (Caddy), SSH khoá + fail2ban, Dependabot (G1–G2) |
| 9 | **Rate limiting** | ✅ | Giới hạn theo IP cho đăng nhập, đặt hàng, liên hệ, tra cứu, tải ảnh | Giới hạn đăng nhập theo email (G2); Redis khi nhiều instance (G4) |
| 10 | **Caching & CDN** | 🟡 | Cache dữ liệu Next.js 5 phút + xoá theo tag; ảnh cache 365 ngày; gzip | Chưa có CDN — Cloudflare proxy khi cần (G4) |
| 11 | **Load balancing & scaling** | ⬜ | Không cần ở quy mô 1 cửa hàng | Redis cho rate limit + SSE, nhiều instance API (G4, chỉ khi có nhu cầu) |
| 12 | **Error tracking & logs** | ⬜ | Log stdout của container | Giới hạn dung lượng log, Sentry, giám sát uptime + cảnh báo (G1–G2) |
| 13 | **Availability & recovery** | 🟡 | `restart: unless-stopped`, healthcheck Postgres, sao lưu DB hằng đêm (giữ trên VPS) | Sao lưu ảnh, đẩy bản sao lưu ra ngoài VPS, diễn tập khôi phục (G1) |

## Mức tối thiểu để ra mắt

Không cần đủ 13 lớp "xanh" mới bán hàng được. **Bắt buộc trước khi mở cho khách:**

- [ ] Lớp 5: sửa lỗi `.gitignore`, build sạch từ bản clone mới, chạy trên VPS với HTTPS.
- [ ] Lớp 7: CI xanh bắt buộc trước khi merge vào `main`.
- [ ] Lớp 8: SSH chỉ dùng khoá; tường lửa 22/80/443; mật khẩu / secret production ngẫu nhiên.
- [ ] Lớp 12: giám sát uptime báo về điện thoại chủ shop.
- [ ] Lớp 13: sao lưu database **và** ảnh ra ngoài VPS, đã khôi phục thử một lần.
- [ ] Nội dung: thông tin cửa hàng, ≥ 1 danh mục, sản phẩm có ảnh + giá, chính sách đổi trả & vận chuyển.

Phần còn lại làm dần sau ra mắt theo [roadmap.md](roadmap.md).
