# Quy trình làm việc, CI/CD

## 1. Nhánh

| Nhánh | Vai trò |
|---|---|
| `main` | Luôn build được, là bản chạy trên production |
| `feat_<tên>`, `fix_<tên>` | Một tính năng / một lỗi; tạo từ `main`, mở PR về `main` |

Quy tắc:
- Không push thẳng vào `main`; mọi thay đổi qua Pull Request.
- PR nhỏ, một mục đích. Sửa code làm thay đổi hành vi → sửa luôn tài liệu trong `docs/` ở cùng PR.
- Sửa `schema.prisma` → commit kèm thư mục migration mới (`npm run db:migrate`).
- Sửa `packages/types` → kiểm tra cả 3 app còn build được.

## 2. CI hiện có

`.github/workflows/ci.yml` — chạy khi mở / cập nhật PR vào `main`:

```
npm ci  →  lint web  →  lint admin  →  build web  →  build admin  →  prisma generate  →  build api
```

Build web không cần API hay database. `.github/workflows/ai-review.yml` (review PR bằng Claude) đang **tạm tắt**, chỉ chạy tay.

## 3. Cần bổ sung

| Việc | Lợi ích | Ưu tiên |
|---|---|:-:|
| Bật *branch protection* cho `main`: bắt buộc CI xanh trước khi merge | Không merge code hỏng | P0 |
| Thêm lint + type-check cho `apps/api` | Bắt lỗi sớm ở backend | P1 |
| Test e2e API: báo giá, tạo đơn, chuyển trạng thái, phân quyền ADMIN/STAFF (Postgres service trong CI) | Bảo vệ luồng tiền | P1 |
| Dependabot (cập nhật thư viện, cảnh báo lỗ hổng) | Bảo mật | P2 |
| CD: khi merge vào `main` → SSH vào VPS chạy `git pull && docker compose ... up -d --build` | Phát hành không cần thao tác tay | P2 |
| Gắn tag phiên bản (`v1.0.0`) mỗi lần phát hành | Dễ quay lại bản cũ | P2 |

## 4. Checklist phát hành

- [ ] CI xanh, đã chạy thử luồng đặt hàng trên máy dev.
- [ ] Có migration? → sao lưu database trên VPS trước.
- [ ] Merge PR → cập nhật VPS ([deployment.md §5](deployment.md#5-cập-nhật-phiên-bản)).
- [ ] Kiểm tra `/health`, trang chủ, đăng nhập admin, đặt 1 đơn thử rồi huỷ.
- [ ] Cập nhật trạng thái trong [features.md](../01-product/features.md) / [roadmap.md](../05-roadmap/roadmap.md).
