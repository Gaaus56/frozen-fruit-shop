import { business } from "./business";

export interface Policy {
  slug: string;
  title: string;
  content: string;
}

export const policies: Policy[] = [
  {
    slug: "how-to-order",
    title: "Hướng dẫn mua hàng",
    content:
      "Chọn sản phẩm và quy cách đóng gói phù hợp, thêm vào giỏ hàng, sau đó tiến hành thanh toán theo hướng dẫn tại trang checkout. Bạn có thể tra cứu tình trạng đơn hàng bất cứ lúc nào bằng mã đơn hàng và số điện thoại đã đăng ký.",
  },
  {
    slug: "privacy",
    title: "Chính sách bảo mật",
    content:
      "Chúng tôi cam kết bảo mật thông tin cá nhân của khách hàng, chỉ sử dụng cho mục đích xử lý đơn hàng và chăm sóc khách hàng, không chia sẻ cho bên thứ ba khi chưa có sự đồng ý.",
  },
  {
    slug: "payment",
    title: "Chính sách thanh toán",
    content:
      "Hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, và các ví điện tử/cổng thanh toán online phổ biến. Đơn hàng được xử lý ngay sau khi xác nhận thanh toán thành công.",
  },
  {
    slug: "shipping",
    title: "Chính sách vận chuyển",
    content:
      "Sản phẩm được đóng gói bằng thùng cách nhiệt chuyên dụng kèm đá gel để giữ lạnh trong suốt quá trình vận chuyển. Thời gian giao hàng dự kiến 1-3 ngày tùy khu vực. Hiện tại giao hàng được hỗ trợ tại các tỉnh/thành có dịch vụ vận chuyển lạnh; vui lòng liên hệ để kiểm tra khu vực của bạn.",
  },
  {
    slug: "returns",
    title: "Chính sách đổi trả",
    content: [
      "1. Điều kiện đổi trả",
      "Khách hàng được đổi trả khi thuộc một trong các trường hợp sau:",
      "• Hàng lỗi do nhà sản xuất (sượn, đắng, chua, lên men).",
      "• Hư hỏng do quá trình vận chuyển.",
      "• Giao sai sản phẩm, sai khối lượng hoặc sai với yêu cầu trong đơn đặt hàng.",
      "• Sản phẩm bị rã đông hoàn toàn trước khi đến tay khách hàng (cần quay video mở thùng làm bằng chứng).",
      "",
      "Lưu ý quan trọng: bắt buộc quay video mở thùng hàng ngay khi nhận hàng. Video phải rõ ràng, không chỉnh sửa, không cắt ghép, thể hiện đầy đủ quá trình mở thùng và kiểm tra sản phẩm. Cửa hàng không giải quyết khiếu nại nếu không có video mở thùng hàng.",
      "",
      "2. Thời gian đổi trả",
      "• Nội thành: đổi trả ngay trong 1–3 giờ.",
      "• Ngoại tỉnh: cấp đông lại trong 24 giờ sau khi nhận hàng, rồi đóng thùng gửi về cửa hàng.",
      "",
      "3. Hình thức đổi trả",
      "• Đổi sản phẩm mới cùng loại nếu có hàng sẵn.",
      "• Hoàn tiền hoặc đổi sang sản phẩm khác.",
      "• Không hỗ trợ đổi trả nếu hàng đã bị mở ra hoặc rã đông do bảo quản sai cách sau khi nhận hàng.",
      "",
      "4. Liên hệ hỗ trợ",
      `Hotline/Zalo ${business.hotlineHours}: ${business.phoneDisplay}`,
      `Địa chỉ cửa hàng: ${business.address} (${business.addressLandmark}).`,
      "",
      "Lưu ý bảo quản: trái cây đông lạnh cần được bảo quản ở nhiệt độ -18°C (tủ đông) ngay sau khi nhận hàng. Rã đông bằng nhiệt độ phòng hoặc ngăn mát tủ lạnh trong 6–8 tiếng; ngoài ra có thể rã đông bằng nước trong 5–15 phút.",
    ].join("\n"),
  },
  {
    slug: "terms-of-service",
    title: "Điều khoản dịch vụ",
    content:
      "Khi sử dụng website và đặt hàng, quý khách đồng ý với các điều khoản về giá cả, thanh toán, vận chuyển và đổi trả được quy định tại các trang chính sách liên quan.",
  },
];

export function getPolicyBySlug(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}
