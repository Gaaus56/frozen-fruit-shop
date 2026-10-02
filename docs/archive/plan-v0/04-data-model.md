# 04. Mô hình dữ liệu (Data Model)

> Lưu ý: Vì dữ liệu sản phẩm/đơn hàng/khách hàng thực tế được lưu trữ và quản lý trong nền tảng commerce đã chọn (xem `02-tech-stack.md`, ví dụ Shopify), tài liệu này mô tả **mô hình dữ liệu ở mức frontend cần đọc/ghi** — tức là "hình dạng" dữ liệu mà storefront cần, không phải thiết kế schema database nội bộ.

## 1. Product (Sản phẩm)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id / slug | string | Định danh, dùng cho URL |
| name | string | Tên sản phẩm |
| category | reference | Liên kết tới Category |
| images | array<url> | Ảnh sản phẩm |
| description | rich text | Mô tả chi tiết |
| storageInfo | object | `{ temperature, shelfLifeDays, thawInstructions }` |
| rating | number | Điểm đánh giá trung bình |
| reviewCount | number | Số lượt đánh giá |
| variants | array<ProductVariant> | Các biến thể theo quy cách đóng gói |
| tags | array<string> | Ví dụ: "bán chạy", "mới", "sơ chế sẵn" |
| isWholesaleAvailable | boolean | Có bán sỉ hay không |
| relatedProductIds | array<id> | Sản phẩm liên quan |

## 2. ProductVariant (Biến thể sản phẩm)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | string | Định danh biến thể |
| packageSize | string | Ví dụ: "250g", "500g", "1kg" |
| price | number | Giá bán (VNĐ) |
| pricePerKg | number | Giá quy đổi theo kg (hiển thị so sánh) |
| stockStatus | enum | `in_stock` \| `out_of_stock` \| `low_stock` |
| sku | string | Mã SKU (nếu cần đối chiếu với nền tảng commerce) |

## 3. Category (Danh mục)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id / slug | string | Định danh, dùng cho URL |
| name | string | Ví dụ: "Xoài đông lạnh" |
| image | url | Ảnh đại diện danh mục |
| description | text | Mô tả ngắn (hỗ trợ SEO) |

## 4. Cart (Giỏ hàng — trạng thái phía client, đồng bộ với commerce platform's cart API)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | string | ID giỏ hàng (do commerce platform cấp) |
| items | array<CartItem> | Danh sách sản phẩm trong giỏ |
| subtotal | number | Tạm tính |
| shippingEstimate | number \| null | Phí vận chuyển ước tính |
| discountCode | string \| null | Mã giảm giá đã áp dụng |
| total | number | Tổng cộng |

### CartItem
| Trường | Kiểu | Mô tả |
|---|---|---|
| productId | id | Tham chiếu Product |
| variantId | id | Tham chiếu ProductVariant |
| quantity | number | Số lượng |
| unitPrice | number | Đơn giá tại thời điểm thêm giỏ |

## 5. Order (Đơn hàng)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id / orderNumber | string | Mã đơn hàng hiển thị cho khách |
| customerInfo | object | `{ name, phone, email }` |
| shippingAddress | object | `{ province, district, ward, addressLine }` |
| items | array<CartItem> | Sản phẩm đã đặt (snapshot giá tại thời điểm đặt) |
| shippingMethod | string | Phương thức vận chuyển đã chọn |
| paymentMethod | enum | `cod` \| `bank_transfer` \| `online_payment` |
| status | enum | `pending` \| `confirmed` \| `packing` \| `shipping` \| `delivered` \| `cancelled` |
| subtotal, shippingFee, discount, total | number | Các khoản tiền |
| createdAt | datetime | Thời gian đặt hàng |

## 6. Customer (Khách hàng đã đăng ký)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | string | Định danh (do commerce platform quản lý auth) |
| name, email, phone | string | Thông tin cá nhân |
| savedAddresses | array<Address> | Địa chỉ đã lưu |
| wishlist | array<productId> | Sản phẩm yêu thích |
| orderHistory | array<orderId> | Tham chiếu đơn hàng |

## 7. BlogPost (Bài viết)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id / slug | string | Định danh, dùng cho URL |
| title | string | Tiêu đề |
| coverImage | url | Ảnh đại diện |
| excerpt | text | Trích đoạn hiển thị ở danh sách |
| content | rich text | Nội dung đầy đủ |
| category | string | Ví dụ: "Mẹo bảo quản", "Công thức nấu ăn" |
| publishedAt | datetime | Ngày đăng |
| relatedPostIds | array<id> | Bài viết liên quan |

## 8. DeliveryZone (Khu vực giao hàng)

Dữ liệu cấu hình đặc thù cho hàng đông lạnh, dùng để validate ở bước checkout.

| Trường | Kiểu | Mô tả |
|---|---|---|
| province | string | Tên tỉnh/thành |
| isSupported | boolean | Có hỗ trợ giao hàng đông lạnh tới khu vực này không |
| estimatedDeliveryDays | number | Số ngày giao hàng dự kiến |
| shippingFeeBase | number | Phí vận chuyển cơ bản (có thể cộng thêm theo trọng lượng) |

## 9. WholesaleInquiry (Yêu cầu đặt hàng sỉ)

| Trường | Kiểu | Mô tả |
|---|---|---|
| companyOrShopName | string | Tên công ty/cửa hàng |
| contactName, phone, email | string | Thông tin liên hệ |
| interestedProducts | array<productId> | Sản phẩm quan tâm |
| estimatedQuantity | string | Số lượng dự kiến (mô tả tự do) |
| message | text | Ghi chú thêm |

## 10. Sơ đồ quan hệ (đơn giản hóa)

```
Category 1───* Product 1───* ProductVariant
                  │
                  └─── * Review

Cart *───* CartItem ───1 ProductVariant

Order *───* CartItem (snapshot)
Order *───1 DeliveryZone (thông qua shippingAddress.province)

Customer 1───* Order
Customer 1───* Address
Customer *───* Product (wishlist)
```
