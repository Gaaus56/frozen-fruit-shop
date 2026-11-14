# Nhật ký lỗi & cách giải quyết

Ghi lại các **vấn đề đã gặp trong lúc code**: hiện tượng, nguyên nhân gốc, cách đã sửa và bài học để không lặp lại.
Khác với [findings.md](findings.md) (lỗi phát hiện khi đọc code, **còn mở**), file này là lịch sử các lỗi **đã điều tra / đã xử lý**.

> **Quy tắc cập nhật:** mỗi khi gặp lỗi mới (hoặc lỗi cũ tái diễn) → thêm một mục theo [mẫu](#mẫu-ghi-một-lỗi-mới) vào đúng nhóm, đánh ID kế tiếp, và thêm một dòng vào [bảng tra nhanh](#bảng-tra-nhanh). Lỗi chưa sửa xong ghi trạng thái 🟡 và cập nhật khi xong.

Trạng thái: ✅ đã sửa · 🟡 sửa một phần / theo dõi · ℹ️ không phải lỗi (giải thích hành vi) · ⚠️ lưu ý môi trường / công cụ

---

## Bảng tra nhanh

| ID | Nhóm | Vấn đề | Trạng thái |
|---|---|---|---|
| [B-01](#b-01--admin-rất-lag-không-bấm-được-gì) | Hiệu năng | Admin rất lag, không bấm được gì khi mở nhiều tab | ✅ |
| [B-02](#b-02--đăng-bài-chậm) | Hiệu năng | "Đăng bài lâu" | ℹ️ |
| [B-03](#b-03--khoảng-cách-dòng-trong-bài-viết-không-đều) | Soạn thảo | Khoảng cách dòng trong bài không đều | ℹ️ |
| [B-04](#b-04--chèn-chia-2-cột-làm-mất-chữ-đang-bôi-đen) | Soạn thảo | Bấm "Chia 2 cột" khi đang bôi đen chữ → mất chữ | ✅ |
| [B-05](#b-05--sau-đổi-bên-mất-nút-bỏ-chia-cột) | Soạn thảo | Sau "Đổi bên", nút "Bỏ chia cột" biến mất | ✅ |
| [B-06](#b-06--chữ-gợi-ý-không-hiện-trong-cột) | Soạn thảo | Chữ gợi ý không hiện trong ô cột | ✅ |
| [B-07](#b-07--bộ-lọc-api-xoá-màu-nút) | Soạn thảo / API | Bộ lọc HTML xoá mất màu nút điều hướng | ✅ |
| [B-08](#b-08--khối-chia-cột-bị-cắt-đôi-khi-hiển-thị) | Hiển thị nội dung | Khối chia cột có nguy cơ bị cắt đôi khi hiển thị | ✅ |
| [B-09](#b-09--chuỗi-dài-tràn-khỏi-khung) | Giao diện | Tóm tắt / nội dung có chuỗi dài không dấu cách tràn khung | ✅ |
| [B-10](#b-10--header-bị-ám-màu-nền) | Giao diện | Header bị ám màu xanh của nền trang | ✅ |
| [B-11](#b-11--ô-nhập-liệu-đổi-màu-theo-nền-trang) | Giao diện | Ô nhập liệu đổi màu theo nền trang | ✅ |
| [B-12](#b-12--banner-các-trang-cao-thấp-khác-nhau) | Giao diện | Banner đầu trang Giới thiệu thấp hơn các trang khác | ✅ |
| [B-13](#b-13--nút-mua-ngay-bị-đè-trên-mobile) | Giao diện | Nút "Mua ngay" bị nút lướt banner đè trên điện thoại | ✅ |
| [B-14](#b-14--dải-tự-lướt-giật-dưới-tay-khách) | Giao diện | Dải tự lướt giật ngay sau khi khách vuốt | ✅ |
| [B-15](#b-15--nút-quay-lại-bị-logo-che) | Giao diện | Nút quay lại bị logo che trên máy tính | ✅ |
| [B-16](#b-16--tên-sản-phẩm-trong-giỏ-bị-ép-từng-chữ-trên-mobile) | Giao diện | Tên sản phẩm trong giỏ bị ép từng chữ một dòng | ✅ |
| [B-17](#b-17--dải-nền-xám-thừa-dưới-footer-trên-mobile) | Giao diện | Dải nền xám thừa dưới footer trên mobile | ✅ |
| [B-18](#b-18--khung-fanpage-bị-cắt-email-bị-ngắt-giữa-chừng) | Giao diện | Khung Fanpage bị cắt, email bị ngắt giữa chừng | ✅ |
| [B-19](#b-19--bản-đồ-không-có-ghim-cửa-hàng) | Bản đồ | Bản đồ không có ghim cửa hàng | ✅ |
| [B-20](#b-20--nút-quay-lại-không-biết-trang-trước) | Điều hướng | Nút quay lại không biết khách đến từ trang nào | ✅ |
| [B-21](#b-21--link-vẫn-mở-đè-lên-tab-web) | Điều hướng | "Link vẫn mở đè lên tab web" | ℹ️ + ✅ |
| [B-22](#b-22--pdf-hoá-đơn-có-ảnh-nền-xám-và-tràn-2-trang) | Bill / In | PDF hoá đơn có ảnh, nền xám, tràn 2 trang | ✅ |
| [B-23](#b-23--bấm-lưu-pdf-làm-chạy-lại-hiệu-ứng-in-bill) | Bill / In | Bấm "Lưu PDF" làm chạy lại hiệu ứng in bill | ✅ |
| [B-24](#b-24--giấy-bill-ra-ngược-chiều) | Bill | Giấy bill chui ra ngược chiều (phần cuối lộ trước) | ✅ |
| [B-25](#b-25--thùng-hàng-trên-nút-đặt-hàng-bị-cắt) | Bill | Thùng hàng trên nút Đặt hàng bị cắt | ✅ |
| [B-26](#b-26--bill-đổi-thứ-tự-khi-bấm-xem) | Bill | Bill trong trang Tra cứu đổi thứ tự khi bấm xem | ✅ |
| [B-27](#b-27--đã-sửa-code-nhưng-web-vẫn-hiện-cái-cũ) | Môi trường dev | Đã sửa code nhưng web vẫn hiện cái cũ | ℹ️ |
| [B-28](#b-28--xem-trước--sửa-lần-đầu-không-hiện-viền) | Xem trước & sửa | Lần mở đầu không hiện viền sửa | ✅ |
| [B-29](#b-29--viền-sửa-lệch-khi-cuộn) | Xem trước & sửa | Viền sửa lệch khỏi đối tượng khi cuộn | ✅ |
| [B-30](#b-30--chữ-đỏ-không-đủ-tương-phản) | Truy cập | Chữ / nút đỏ không đủ tương phản (axe) | ✅ |
| [B-31](#b-31--quá-nhiều-yêu-cầu-429-khi-test) | API | "Bạn thao tác quá nhanh" (429) khi test | ℹ️ |
| [B-32](#b-32--seed-tạo-nhân-viên-không-có-quyền-nào) | Dữ liệu mẫu | Seed tạo nhân viên không có quyền nào | ✅ |
| [B-33](#b-33--ảnh-mẫu-404-trên-render) | Deploy | Ảnh mẫu 404 trên Render (bị `.dockerignore` loại khỏi image) | ✅ |
| [B-34](#b-34--số-điện-thoại-bị-bẻ-xuống-dòng) | Giao diện | Số điện thoại bị bẻ đôi xuống dòng trên điện thoại | ✅ |
| [B-35](#b-35--hàng-nút-thành-liên-kết-khi-mở-lại) | Soạn thảo | Hàng nút điều hướng biến thành chữ liên kết khi mở lại bài | ✅ |
| [B-36](#b-36--mở-bản-ghi-dẫn-tới-trang-404) | Admin | "Mở bản ghi này" ở Lịch sử chỉnh sửa dẫn tới trang 404 (Liên hệ, Bình luận) | ✅ |
| [T-01](#t-01--prisma-generate-báo-eperm-trên-windows) | Công cụ | `prisma generate` báo EPERM trên Windows | ⚠️ |
| [T-02](#t-02--sửa-packagestypes-mà-api--web-không-thấy-thay-đổi) | Công cụ | Sửa `packages/types` mà app không thấy thay đổi | ⚠️ |
| [T-03](#t-03--lỗi-type-trong-nexttypes-sau-khi-xoá-trang) | Công cụ | Lỗi type trong `.next/types` sau khi xoá trang | ⚠️ |
| [T-04](#t-04--chạy-prettier-làm-đổi-định-dạng-cả-file) | Công cụ | Chạy Prettier làm đổi định dạng cả file | ⚠️ |
| [T-05](#t-05--lint-react-19-chặn-một-số-cách-viết-quen-thuộc) | Công cụ | Lint React 19 chặn một số cách viết quen thuộc | ⚠️ |
| [T-06](#t-06--chữ-tiếng-việt-bị-lỗi-font-khi-gọi-api-bằng-curl) | Công cụ | Chữ tiếng Việt bị lỗi khi gọi API bằng curl | ⚠️ |
| [T-07](#t-07--test-playwright-hay-gặp) | Công cụ | Lỗi hay gặp khi viết test Playwright | ⚠️ |
| [T-08](#t-08--bước-dọn-dẹp-của-test-xoá-nhầm-dữ-liệu-thật) | Công cụ | Bước dọn dẹp của test xoá nhầm tài khoản nhân viên thật | ⚠️ |
| [T-09](#t-09--thư-mục-build-thử-bị-commit-vào-git) | Công cụ | Thư mục build thử `.buildcheck/` bị commit vào git | ✅ |

---

## Hiệu năng

### B-01 — Admin rất lag, không bấm được gì
- **Hiện tượng:** mở nhiều tab admin thì trang treo, bấm nút không phản hồi, có request chờ mãi.
- **Nguyên nhân gốc:** mỗi tab admin giữ **một kết nối SSE** (`/admin/events`) để nhận thông báo realtime. Trình duyệt chỉ cho **6 kết nối HTTP/1.1 tới cùng một máy chủ** → từ khoảng tab thứ 6, mọi request khác (lưu form, tải trang) phải xếp hàng chờ.
- **Cách sửa:** chỉ **một tab** (tab "trưởng", bầu bằng Web Locks API) mở EventSource; các tab khác nhận sự kiện qua `BroadcastChannel`. Tab trưởng đóng → tab khác tự lên thay.
- **File:** `apps/admin/src/lib/shared-event-source.ts`, `apps/web/src/lib/shared-event-source.ts`.
- **Bài học:** kết nối dài (SSE, long-polling) phải **dùng chung giữa các tab**. Khi deploy thật nên bật HTTP/2 (Caddy mặc định có) — giới hạn 6 kết nối chỉ áp dụng HTTP/1.1.

### B-02 — Đăng bài chậm
- **Hiện tượng:** cảm giác bấm "Đăng bài" lâu.
- **Kết quả đo:** API xử lý **0,2–0,3 giây**. Chậm là do **chế độ dev** của Next.js biên dịch trang lần đầu khi chuyển trang.
- **Kết luận:** ℹ️ không phải lỗi; bản build production không có độ trễ biên dịch này.

---

## Trình soạn thảo (admin)

### B-03 — Khoảng cách dòng trong bài viết không đều
- **Hiện tượng:** có chỗ hai dòng sát nhau, có chỗ cách xa.
- **Nguyên nhân:** **Enter** tạo đoạn mới (có khoảng cách), **Shift + Enter** xuống dòng trong cùng đoạn (`<br>`, không có khoảng cách).
- **Xử lý:** ℹ️ đúng thiết kế; thêm dòng hướng dẫn ở cuối khung soạn thảo: "Enter: đoạn mới · Shift+Enter: xuống dòng trong cùng đoạn".

### B-04 — Chèn "Chia 2 cột" làm mất chữ đang bôi đen
- **Hiện tượng:** đang bôi đen chữ mà bấm "Chia 2 cột" → đoạn chữ đó bị thay bằng khung cột.
- **Nguyên nhân:** lệnh chèn dùng `insertContent`, mà Tiptap **thay thế vùng đang chọn** bằng nội dung chèn.
- **Cách sửa:** viết lệnh riêng: chèn khung cột **sau** khối đang đứng (chỉ thay khi đang ở dòng trống), rồi đặt con trỏ vào cột trái (`TextSelection.create(doc, pos + 3)`).
- **File:** `apps/admin/src/components/editor/extensions.tsx` (`insertColumns`).
- **Bài học:** lệnh chèn khối mới **không được dùng vùng chọn hiện tại làm chỗ chèn** trừ khi chủ đích là thay thế.

### B-05 — Sau "Đổi bên" mất nút "Bỏ chia cột"
- **Nguyên nhân:** `tr.replaceWith(...)` thay cả khung cột → con trỏ bị đẩy ra ngoài khung → thanh công cụ không còn thấy "đang trong cột".
- **Cách sửa:** sau khi thay, đặt lại con trỏ vào đầu cột trái: `tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 3)))`.
- **Bài học:** thao tác thay node xong phải **chủ động đặt lại selection** nếu UI phụ thuộc vị trí con trỏ.

### B-06 — Chữ gợi ý không hiện trong cột
- **Nguyên nhân:** extension `Placeholder` mặc định chỉ gắn class `is-empty` cho node cấp ngoài cùng.
- **Cách sửa:** `Placeholder.configure({ includeChildren: true })` + CSS riêng cho `div[data-column] p.is-empty:only-child::before`.

### B-07 — Bộ lọc API xoá màu nút
- **Hiện tượng:** nút điều hướng trong bài lưu xong mất màu.
- **Nguyên nhân:** `transformTags.a` trong `sanitize-html` **dựng lại toàn bộ thuộc tính** thẻ `<a>` chỉ với `href/target/rel` → `data-button` bị bỏ trước khi đến bước `allowedAttributes`.
- **Cách sửa:** giữ `data-button` trong transform; `allowedAttributes` vẫn lọc lại chỉ nhận `red|dark|light|green`.
- **File:** `apps/api/src/common/rich-text.ts`.
- **Bài học:** thêm thuộc tính mới vào nội dung soạn thảo → kiểm tra **cả `transformTags` lẫn `allowedAttributes`**.

### B-35 — Hàng nút thành liên kết khi mở lại
- **Ngày:** 2026-10-12
- **Hiện tượng:** tạo "Nút" trong trình soạn thảo, lưu, mở lại → hàng nút biến thành một dòng chữ gạch chân "Xem sản phẩmLiên hệGiới thiệu". Lưu tiếp lần nữa thì mất hẳn nút (web chỉ còn liên kết chữ).
- **Nguyên nhân:** HTML lưu đúng (`<p data-buttons><a data-button…>`), nhưng khi nạp lại, quy tắc đọc `p[data-buttons]` của node `buttonRow` không có `priority` → ngang hàng với Paragraph (đọc mọi `<p>`, mặc định 50) và Paragraph được thử trước → thành đoạn văn chứa 3 liên kết. Lúc chèn mới thì không lỗi vì node được tạo bằng lệnh, không qua bước đọc HTML.
- **Cách sửa:** `parseHTML() { return [{ tag: "p[data-buttons]", priority: 60 }] }` (extensions.tsx).
- **Bài học:** node tuỳ biến dựa trên thẻ mà node có sẵn cũng đọc (`p`, `div`, `span`…) phải đặt `priority` > 50; kiểm thử phải có bước **lưu → mở lại** chứ không chỉ chèn rồi xem.

---

## Hiển thị nội dung có định dạng (web)

### B-08 — Khối chia cột bị cắt đôi khi hiển thị
- **Nguy cơ:** `RichContent` tách HTML tại chỗ có ô sản phẩm / link sản phẩm đứng riêng một dòng để chèn thẻ sản phẩm. Nếu link sản phẩm nằm **trong cột** → HTML bị cắt giữa thẻ `<div>`, vỡ bố cục.
- **Cách sửa:** coi cả khung cột là **một khối nguyên**, chỉ tách ô sản phẩm ở phần ngoài cột. Trong cột không cho chèn ô sản phẩm (schema Tiptap), không lồng cột → `</div></div>` đầu tiên luôn là chỗ khung cột kết thúc.
- **Lỗi phụ khi sửa:** regex viết trong template string `` `[\s\S]` `` bị mất dấu `\` (thành `[sS]`) → phải viết `` `[\\s\\S]` ``.
- **File:** `apps/web/src/components/ui/rich-content.tsx`.

### B-09 — Chuỗi dài tràn khỏi khung
- **Hiện tượng:** tóm tắt "1233333…" (không dấu cách) tràn ra ngoài thẻ tin tức / trang bài viết.
- **Cách sửa:** `overflow-wrap: anywhere` cho `.rich-content-flow`, thẻ tin tức, khung bài viết.
- **Bài học:** mọi chỗ hiển thị **chữ do người dùng nhập** cần chống tràn (`overflow-wrap:anywhere` / `min-w-0` trong flex/grid).

---

## Giao diện web

### B-10 — Header bị ám màu nền
- **Nguyên nhân:** header dùng `bg-card/95` + `backdrop-blur` → nền trang xanh nhạt xuyên qua.
- **Cách sửa:** header, menu thả xuống, ô tìm kiếm, thanh điều hướng dưới, danh sách liên hệ dùng **`bg-card` đặc** (trắng).

### B-11 — Ô nhập liệu đổi màu theo nền trang
- **Nguyên nhân:** `inputClass` dùng `bg-background` → đổi nền trang (xanh băng) thì ô nhập cũng xanh.
- **Cách sửa:** thêm token riêng `--field: #f3f2f2` (xám ấm), ô nhập dùng `bg-field`.
- **Bài học:** mỗi vai trò màu (nền trang, thẻ, ô nhập, khung phụ) nên có **token riêng**, không dùng chung để đổi một chỗ không kéo theo chỗ khác.

### B-12 — Banner các trang cao thấp khác nhau
- **Nguyên nhân:** banner Sản phẩm / Tin tức có hàng nút lọc, Giới thiệu không có; trên mobile nút lọc danh mục còn xuống 2–3 dòng.
- **Cách sửa:** `PageHero` có chiều cao tối thiểu cố định (`min-h-80`, `sm:min-h-[16.25rem]`), chữ căn giữa dọc; nút lọc trên mobile thành **một hàng vuốt ngang**. Kết quả đo: 261px (máy tính), 321px (điện thoại) cho cả 3 trang.

### B-13 — Nút "Mua ngay" bị đè trên mobile
- **Cách sửa:** ẩn nút ‹ › trên màn nhỏ (`hidden sm:flex`), thêm vuốt ngón tay (`useSwipe`) cho banner và ảnh sản phẩm.
- **File:** `apps/web/src/lib/use-swipe.ts`.

### B-14 — Dải tự lướt giật dưới tay khách
- **Hiện tượng:** khách vừa vuốt xong, dải danh mục / tin tức tự lướt tiếp ngay.
- **Cách sửa:** `AutoScrollTrack` ghi lần chạm / vuốt / cuộn ngang cuối, **chờ đủ một nhịp (5 giây)** mới tự lướt lại.

### B-15 — Nút quay lại bị logo che
- **Nguyên nhân:** logo dạng huy hiệu treo xuống dưới header trên máy tính, nút đặt ở góc trên trái trang bị đè.
- **Cách sửa:** đặt nút quay lại **trong khung nội dung**, cạnh nhãn danh mục / loại bài viết.

### B-16 — Tên sản phẩm trong giỏ bị ép từng chữ trên mobile
- **Nguyên nhân:** ảnh + tên + ô số lượng + nút Xóa cùng một hàng → tên chỉ còn vài chục px.
- **Cách sửa:** trên mobile, tên chiếm hết phần cạnh ảnh; ô số lượng và nút Xóa xuống hàng dưới.

### B-17 — Dải nền xám thừa dưới footer trên mobile
- **Nguyên nhân:** `body` có `pb-24` (chừa chỗ thanh điều hướng dưới) → phần đệm hiện màu nền trang dưới footer.
- **Cách sửa:** chuyển phần đệm vào **trong footer** (thanh cuối) → nền footer kéo tới đáy.

### B-18 — Khung Fanpage bị cắt, email bị ngắt giữa chừng
- **Nguyên nhân:** Facebook Page Plugin dạng iframe **không tự co theo khung** (vẽ đúng `width` truyền vào); email dài trong cột hẹp + `overflow-wrap:anywhere` bị ngắt giữa từ.
- **Cách sửa:** đặt bề ngang cố định 280px cho plugin; nới cột Liên hệ (`lg:col-span-4`).

### B-34 — Số điện thoại bị bẻ xuống dòng
- **Ngày:** 2026-10-12
- **Hiện tượng:** trên điện thoại, trang Đặt hàng thành công hiện "gọi **0396 799** / **579**" — số bị tách làm hai dòng.
- **Nguyên nhân:** `formatPhone` (packages/types) nhóm số bằng dấu cách thường, trình duyệt được phép ngắt dòng ở đó.
- **Cách sửa:** `formatPhone` nối các cụm bằng dấu cách không ngắt dòng (U+00A0) → mọi nơi dùng hàm (web, bill, thẻ cam kết qua `{phone}`) không bao giờ bẻ đôi số; link `tel:` vẫn bỏ khoảng trắng bằng `\s` (khớp cả U+00A0). Chỗ hiện số thô ở trang Tin tức (Zalo tuyển dụng) chuyển sang dùng `formatPhone`.
- **Bài học:** chuỗi phải đọc liền một khối (số điện thoại, mã đơn, giá tiền) thì dùng khoảng trắng không ngắt hoặc `whitespace-nowrap` ngay từ hàm định dạng, không vá từng chỗ hiển thị.

---

## Bản đồ

### B-19 — Bản đồ không có ghim cửa hàng
- **Nguyên nhân:**
  1. Link admin lưu là link rút gọn `maps.app.goo.gl/...` — **không nhúng iframe được**.
  2. Nhúng theo địa chỉ chữ ghép thêm "Chợ Đầu Mối Hòa Khánh" → Google không tìm ra điểm, chỉ hiện khu vực.
- **Cách sửa:** server mở link rút gọn (đọc header `Location`, cache 1 ngày), lấy **tên địa điểm Google** (`/maps/place/<tên>`) → nhúng `maps?q=<tên>&output=embed` → có ghim + thẻ đánh giá. Không lấy được thì dùng toạ độ, cuối cùng mới dùng địa chỉ.
- **File:** `apps/web/src/lib/map-embed.ts`.

---

## Điều hướng

### B-20 — Nút quay lại không biết trang trước
- **Nguyên nhân:** chuyển trang phía client (Next.js) **không cập nhật `document.referrer`** → không biết khách đến từ trong web hay link ngoài.
- **Cách sửa:** `NavigationTracker` (gắn ở layout) ghi nhận đã chuyển trang trong web; có lịch sử trong web thì `router.back()`, không thì về trang danh sách (`fallbackHref`).
- **File:** `apps/web/src/components/ui/back-button.tsx`.

### B-21 — "Link vẫn mở đè lên tab web"
- **Kiểm tra:** trong Chrome, link Zalo / Facebook / Maps / portfolio đều mở **tab mới** (đã đếm số tab trước / sau khi bấm).
- **Nguyên nhân thường gặp:** xem web trong **khung xem trước của VS Code**, trình duyệt trong app (Zalo, Messenger), hoặc trên điện thoại (link mở thẳng ứng dụng). Link **nội bộ** cố ý mở cùng tab.
- **Đã sửa thêm:** nút banner gắn link ngoài (`LinkButton`) và link ngoài trong **nội dung lưu từ trước** (API gắn `target="_blank"` lúc trả nội dung ra).

---

## Bill & in

### B-22 — PDF hoá đơn có ảnh, nền xám, tràn 2 trang
- **Nguyên nhân:** "In / Lưu PDF" in **chính tờ bill trên màn hình** (dải ảnh đỏ, font máy in nhiệt) bằng mẹo `visibility:hidden` — các phần khác vẫn chiếm chỗ nên trang dài thành 2 trang, nền `body` xám vẫn in.
- **Cách sửa:** tạo **hoá đơn A4 riêng** (`PrintInvoice`) chỉ có thông tin, gắn thẳng dưới `<body>` bằng portal; CSS in dùng `body > *:not(.print-invoice) { display:none }` + `@page A4`.
- **File:** `apps/web/src/components/receipt/print-invoice.tsx`, phần `@media print` trong `globals.css`.
- **Bài học:** bản in nên là **một bố cục riêng**, không in lại giao diện màn hình.

### B-23 — Bấm "Lưu PDF" làm chạy lại hiệu ứng in bill
- **Nguyên nhân:** khi in, trang bị ẩn (`display:none`) rồi hiện lại; trình duyệt **chạy lại mọi animation CSS** của phần tử vừa hiện lại.
- **Cách sửa:** hiệu ứng chỉ gắn **trong lúc chạy**, xong thì gỡ class (bắt `onAnimationEnd`) — áp dụng cho giấy nhả ra, cú bật nhẹ, nền hộp xem bill, dấu ✓ đặt hàng thành công.
- **Bài học:** animation chỉ-chạy-một-lần **không được để class gắn vĩnh viễn** nếu phần tử có thể bị ẩn / hiện lại (in, tab ẩn, `display:none`).

### B-24 — Giấy bill ra ngược chiều
- **Nguyên nhân:** trượt cả tờ bằng `translateY(-100%) → 0` → phần **cuối** bill lộ ra trước.
- **Cách sửa:** "nhả giấy" bằng `grid-template-rows: 0fr → 1fr` (`steps(28)`) → đầu bill (dải đỏ) ló ra trước sát khe, giấy dài dần xuống như máy in thật.

### B-25 — Thùng hàng trên nút Đặt hàng bị cắt
- **Nguyên nhân:** xe tải đặt cao, thùng hàng rơi từ trên vượt quá chiều cao nút (`overflow:hidden`).
- **Cách sửa:** hạ xe xuống, thu nhỏ xe và thùng hàng cho vừa nút cao 56px.

### B-26 — Bill đổi thứ tự khi bấm xem
- **Nguyên nhân:** `saveReceipt` luôn đưa bill vừa lưu lên đầu danh sách, kể cả khi chỉ cập nhật trạng thái.
- **Cách sửa:** bill **đã có** thì sửa tại chỗ; chỉ bill **mới** mới thêm lên đầu.
- **File:** `apps/web/src/lib/saved-receipts.ts`.

---

## Môi trường dev

### B-27 — Đã sửa code nhưng web vẫn hiện cái cũ
- **Ví dụ:** đã xoá dấu ✓ trong chữ nút "Đặt hàng thành công" nhưng vẫn thấy.
- **Nguyên nhân:** tab trình duyệt đang chạy code nạp **trước khi lưu file** (đang giữa thao tác, hot reload chưa áp dụng). Kiểm tra lại bằng trình duyệt mới thì chữ đã đúng.
- **Xử lý:** ℹ️ tải lại cứng **Ctrl + F5**. Sửa `next.config.ts` thì dev server tự khởi động lại; sửa `.env.local` cần khởi động lại dev server.

---

## Xem trước & sửa (admin)

### B-28 — Xem trước & sửa: lần đầu không hiện viền
- **Nguyên nhân:** admin gửi lệnh bật chế độ sửa ở sự kiện `onLoad` của iframe, nhưng lúc đó React trên web **chưa hydrate xong** → listener `message` chưa có → lệnh bị lỡ.
- **Cách sửa:** thêm bước bắt tay: web chạy xong gửi `tc28:ready`, admin nhận được mới gửi chế độ hiện tại.
- **File:** `apps/web/src/components/layout/preview-edit-overlay.tsx`, `apps/admin/src/app/(dashboard)/preview/preview-client.tsx`.
- **Bài học:** giao tiếp `postMessage` với iframe **không dựa vào `onLoad`** — luôn để phía con báo "sẵn sàng".

### B-29 — Viền sửa lệch khi cuộn
- **Nguyên nhân:**
  1. Viền có `transition` 0,1s → chạy trễ sau phần tử khi cuộn.
  2. Chỉ đo lại khi có sự kiện cuộn — phần tử **tự chuyển động** (thẻ sản phẩm nhấc lên khi rê chuột, dải danh mục tự lướt) thì viền đứng yên.
  3. Cuộn mà không di chuột → phần dưới con trỏ đã đổi nhưng viền vẫn ở phần cũ.
- **Cách sửa:** bỏ transition; đo lại vị trí **mỗi khung hình** (`requestAnimationFrame`, chỉ `setState` khi vị trí đổi); khi cuộn, chọn lại phần dưới con trỏ bằng `document.elementFromPoint`. Kết quả đo: lệch 0px khi đang cuộn và khi cuộn xong.
- **Kèm theo:** đổi thành **bấm đúp** mới mở trang sửa; bấm 1 lần không làm gì (không đi theo link).

---

## Truy cập (a11y)

### B-30 — Chữ đỏ không đủ tương phản
- **Phát hiện:** chạy axe-core (WCAG 2.1 AA) trên 13 trang × 2 kích thước màn hình.
- **Nguyên nhân:** đỏ chủ đạo `#ec3013` với chữ trắng chỉ đạt ~3.9:1 (cần 4.5:1); chữ xám quá nhạt.
- **Cách sửa:** đổi `--color-accent-600` thành `#cf2a10` (5.26:1 với chữ trắng, 4.71:1 trên nền xám); chữ phụ tối thiểu `text-foreground/65`. Sau khi sửa: **0 vi phạm**.
- **Tài liệu:** `design/color.md`, quy trình chạy axe ở [README.md](README.md) mục 6.

---

## API

### B-31 — "Quá nhiều yêu cầu" (429) khi test
- **Hiện tượng:** "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút" khi tra cứu đơn / gửi bình luận liên tục.
- **Nguyên nhân:** ℹ️ giới hạn tốc độ chống spam (lưu trong bộ nhớ, theo IP). Ví dụ bình luận: 5 lần / 10 phút.
- **Khi test:** chờ vài phút, hoặc khởi động lại API (xoá bộ đếm). Ở môi trường dev API tin header `X-Forwarded-For` → test tự động có thể đặt IP giả khác nhau cho mỗi lượt.

### B-32 — Seed tạo nhân viên không có quyền nào
- **Ngày:** 2026-10-12
- **Hiện tượng:** sau khi có phân quyền nhân viên, chạy lại `npm run db:seed:test` thì tài khoản `staff1`, `staff2` đăng nhập không vào được mục nào.
- **Nguyên nhân:** cột `permissions` mặc định rỗng; migration chỉ cấp quyền cho nhân viên **đang có**, còn seed tạo tài khoản mới không ghi quyền.
- **Cách sửa:** seed cấp đủ quyền cho `staff1`, chỉ Đơn hàng + Liên hệ cho `staff2` (để thử phân quyền).
- **Bài học:** thêm cột / ràng buộc mới → cập nhật **cả migration lẫn seed**.

### B-33 — Ảnh mẫu 404 trên Render
- **Ngày:** 2026-10-12
- **Hiện tượng:** bản demo trên Vercel hiện tên, giá sản phẩm nhưng mọi ảnh vỡ; `https://<api>.onrender.com/uploads/seed/xoai1.jpg` trả 404.
- **Nguyên nhân:** `.dockerignore` (viết từ khi ảnh mẫu chỉ dùng ở máy dev) loại `apps/api/prisma/seed-assets` khỏi Docker image. Sau khi API chuyển sang phục vụ ảnh mẫu thẳng từ thư mục này (vì Render không có ổ đĩa lâu dài), thư mục không có trong image → `existsSync` sai → không đăng ký route → 404.
- **Cách sửa:** bỏ dòng đó khỏi `.dockerignore`, deploy lại API.
- **Bài học:** đổi chỗ đọc file lúc chạy → kiểm tra cả `.dockerignore` / Dockerfile; thử build image (hoặc gọi URL ảnh trên bản deploy) trước khi báo xong.

### B-36 — "Mở bản ghi" dẫn tới trang 404
- **Ngày:** 2026-10-12
- **Hiện tượng:** Lịch sử chỉnh sửa → mục *Liên hệ & báo giá* (hoặc *Bình luận*) → bấm "Mở bản ghi này ›" → trang 404 đen mặc định của Next.js.
- **Nguyên nhân:** link tạo theo mẫu chung `/<mục>/<id>`, nhưng hai mục này xử lý ngay trong danh sách, không có trang `[id]`. Admin cũng chưa có trang 404 / trang lỗi riêng nên hiện màn hình mặc định tiếng Anh.
- **Cách sửa:** chỉ tạo link cho các mục có trang sửa riêng (`HAS_DETAIL_PAGE`: banners, categories, home-blocks, orders, policies, posts, products) + settings / users / pages; mục khác ẩn nút. Thêm trang 404 và trang lỗi tiếng Việt cho cả admin (`app/not-found.tsx`, `app/(dashboard)/not-found.tsx` giữ menu, `error.tsx`, `global-error.tsx`) và web (`error.tsx`, `global-error.tsx`, làm lại `not-found.tsx`).
- **Bài học:** link sinh tự động theo mẫu phải đối chiếu với các route có thật; app nào cũng cần trang 404 / lỗi riêng ngay từ đầu.

---

## Công cụ & môi trường

### T-01 — `prisma generate` báo EPERM trên Windows
- **Hiện tượng:** `EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp...'`.
- **Nguyên nhân:** API đang chạy **giữ khoá file engine** `.dll`.
- **Xử lý:** ⚠️ phần client JavaScript và type **vẫn được sinh lại** — thường dùng tiếp được. Nếu đổi phiên bản Prisma / engine thì dừng API, chạy lại `npx prisma generate`, rồi bật API.
- **Ghi chú:** migration viết tay trong `apps/api/prisma/migrations/`, áp dụng bằng `npx prisma migrate deploy`.

### T-02 — Sửa `packages/types` mà API / web không thấy thay đổi
- **Nguyên nhân:** API dùng bản đã build (`packages/types/dist`).
- **Xử lý:** sau khi sửa → `npm run build:packages`. API dev server tự nạp lại.

### T-03 — Lỗi type trong `.next/types` sau khi xoá trang
- **Ví dụ:** `Cannot find module '../../src/app/wholesale/page.js'` sau khi bỏ trang đặt sỉ.
- **Xử lý:** ⚠️ file type cũ do Next sinh ra, không phải lỗi code; tự hết ở lần build / dev tiếp theo. Khi chạy `tsc` có thể lọc dòng bắt đầu bằng `.next/`.

### T-04 — Chạy Prettier làm đổi định dạng cả file
- **Nguyên nhân:** dự án **không cấu hình Prettier**; chạy Prettier với cấu hình mặc định (80 ký tự / dòng) xuống dòng lại toàn bộ file → diff rất lớn.
- **Xử lý:** ⚠️ không chạy Prettier; giữ cách định dạng sẵn có của file, kiểm tra bằng ESLint.

### T-05 — Lint React 19 chặn một số cách viết quen thuộc
| Quy tắc | Cách viết bị chặn | Cách viết thay |
|---|---|---|
| `react-hooks/set-state-in-effect` | `setState` thẳng trong `useEffect` (ví dụ đọc `localStorage` khi mount) | `useSyncExternalStore` (xem `saved-receipts.ts`, `preview.ts`), hoặc gọi trong `requestAnimationFrame` / callback |
| `react-hooks/refs` | Gán `ref.current = value` trong lúc render | Đọc state trực tiếp trong event handler |
| `react-hooks/purity` | `Date.now()` / `Math.random()` trong thân component | Bộ đếm state (ví dụ `reloadKey`) hoặc tính trong event handler |
| `react-hooks/immutability` | Sửa biến bên ngoài trong lúc render (đánh số mục lục) | Tách thành hàm thuần (`numberHeadings`) |

### T-06 — Chữ tiếng Việt bị lỗi khi gọi API bằng curl
- **Hiện tượng:** gọi `PATCH` bằng `curl` trong Git Bash → tiêu đề banner lưu thành ký tự lạ.
- **Xử lý:** ⚠️ gọi bằng `fetch` của Node (UTF-8) hoặc dùng giao diện admin; đọc output tiếng Việt trong Python đặt `PYTHONIOENCODING=utf-8`.

### T-07 — Lỗi hay gặp khi viết test Playwright
- `waitForURL` chờ mãi khi Next chuyển trang phía client → dùng `{ waitUntil: "commit" }`.
- Gửi phím / bấm nút ngay sau khi bấm nút định dạng trong trình soạn thảo → thao tác bị lệch (chữ bị thay mất). Người dùng thật không gặp; trong test nên chờ ~200ms giữa các bước.
- Test luồng **đặt hàng** không được tạo đơn thật → chặn `POST /orders` và `GET /orders/lookup` bằng `page.route`, trả về đơn giả.
- Bấm "Thêm vào giỏ" bị khoá → sản phẩm đang **hết hàng** trong dữ liệu mẫu; chọn sản phẩm còn hàng.
- Gửi lệnh sang iframe ngay khi trang vừa tải → xem [B-28](#b-28--xem-trước--sửa-lần-đầu-không-hiện-viền).

---

### T-08 — Bước dọn dẹp của test xoá nhầm dữ liệu thật
- **Ngày:** 2026-10-12
- **Hiện tượng:** sau khi chạy test phân quyền (tạo rồi xoá một nhân viên tạm), tài khoản nhân viên thật **Trần Thanh An (an@gmail.com)** cũng bị xoá.
- **Nguyên nhân:** bước dọn dẹp bấm "Xoá" ở dòng nhân viên tạm (hộp `confirm` được tự chấp nhận → đã xoá xong), rồi "cho chắc" bấm thêm `getByRole("button", { name: /^Xoá/ }).last()` — lúc đó nút Xoá cuối trang thuộc dòng nhân viên thật → xoá luôn. Xoá tài khoản là xoá cứng, không khôi phục được mật khẩu cũ. Lịch sử xử lý đơn vẫn còn (`onDelete: SetNull`) nhưng mất tên người xử lý.
- **Cách xử lý:** báo chủ dự án, tạo lại tài khoản (mật khẩu mới) nếu cần.
- **Bài học — quy tắc khi viết test chạm vào dữ liệu thật:**
  1. Mọi thao tác xoá phải **nhắm đúng một bản ghi** (theo dòng chứa email / tiêu đề riêng của dữ liệu tạm), **không bao giờ** dùng `.first()` / `.last()` trên nút Xoá chung của trang.
  2. Ưu tiên dọn dẹp qua **API theo id** của bản ghi vừa tạo (biết chắc đối tượng), thay vì bấm giao diện.
  3. Sau khi dọn, **kiểm tra số bản ghi còn lại** so với trước khi chạy test (không chỉ kiểm tra bản ghi tạm đã mất).
  4. Thao tác ghi / xoá trên dữ liệu không tạo ra trong test → không làm; luồng có ghi (đặt hàng…) thì chặn request bằng `page.route` trả dữ liệu giả.

---

### T-09 — Thư mục build thử bị commit vào git
- **Ngày:** 2026-10-12
- **Hiện tượng:** commit `cc7ce72` có thêm ~270 file trong `.buildcheck/` (bản sao web / admin / api).
- **Nguyên nhân:** để build thử production mà không ghi đè `.next` của dev server đang chạy, bản sao app được đặt trong `.buildcheck/` **bên trong repo** (cần để tìm `node_modules` gốc), không có trong `.gitignore`; đúng lúc đó có lệnh commit tất cả.
- **Cách sửa:** xoá thư mục, thêm `/.buildcheck/` vào `.gitignore`; commit việc xoá (hoặc sửa lại commit nếu chưa push).
- **Bài học:** thư mục tạm trong repo phải được ignore **trước khi** tạo; kiểm tra `git status` ngay sau khi xong.

---

## Mẫu ghi một lỗi mới

Thêm vào đúng nhóm phía trên, đánh ID kế tiếp (`B-xx` cho lỗi sản phẩm, `T-xx` cho công cụ / môi trường), rồi thêm một dòng vào [bảng tra nhanh](#bảng-tra-nhanh).

```markdown
### B-xx — <Tên ngắn của lỗi>
- **Ngày:** YYYY-MM-DD
- **Hiện tượng:** người dùng / dev thấy gì, ở trang nào, thiết bị nào.
- **Nguyên nhân:** nguyên nhân gốc (không chỉ triệu chứng).
- **Cách sửa:** đã sửa thế nào; nếu chưa sửa, ghi hướng sửa và trạng thái 🟡.
- **File:** đường dẫn file chính đã sửa.
- **Kiểm tra:** đã xác nhận bằng cách nào (test tay, Playwright, số đo…).
- **Bài học:** quy tắc rút ra để không lặp lại (nếu có).
```
