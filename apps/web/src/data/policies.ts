export interface Policy {
  slug: string;
  title: string;
  content: string;
}

export const policies: Policy[] = [
  {
    slug: "huong-dan-mua-hang",
    title: "Hướng dẫn mua hàng",
    content:
      "Chọn sản phẩm và quy cách đóng gói phù hợp, thêm vào giỏ hàng, sau đó tiến hành thanh toán theo hướng dẫn tại trang checkout. Bạn có thể tra cứu tình trạng đơn hàng bất cứ lúc nào bằng mã đơn hàng và số điện thoại đã đăng ký.",
  },
  {
    slug: "bao-mat",
    title: "Chính sách bảo mật",
    content:
      "Chúng tôi cam kết bảo mật thông tin cá nhân của khách hàng, chỉ sử dụng cho mục đích xử lý đơn hàng và chăm sóc khách hàng, không chia sẻ cho bên thứ ba khi chưa có sự đồng ý.",
  },
  {
    slug: "thanh-toan",
    title: "Chính sách thanh toán",
    content:
      "Hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, và các ví điện tử/cổng thanh toán online phổ biến. Đơn hàng được xử lý ngay sau khi xác nhận thanh toán thành công.",
  },
  {
    slug: "van-chuyen",
    title: "Chính sách vận chuyển",
    content:
      "Sản phẩm được đóng gói bằng thùng cách nhiệt chuyên dụng kèm đá gel để giữ lạnh trong suốt quá trình vận chuyển. Thời gian giao hàng dự kiến 1-3 ngày tùy khu vực. Hiện tại giao hàng được hỗ trợ tại các tỉnh/thành có dịch vụ vận chuyển lạnh; vui lòng liên hệ để kiểm tra khu vực của bạn.",
  },
  {
    slug: "doi-tra",
    title: "Chính sách đổi trả",
    content:
      "Do đặc thù hàng đông lạnh, chúng tôi chỉ hỗ trợ đổi/trả khi sản phẩm còn nguyên bao bì, chưa rã đông, và phát hiện lỗi ngay khi nhận hàng. Vui lòng quay lại video/chụp ảnh tình trạng hàng khi nhận và liên hệ trong vòng 24 giờ.",
  },
  {
    slug: "dieu-khoan-dich-vu",
    title: "Điều khoản dịch vụ",
    content:
      "Khi sử dụng website và đặt hàng, quý khách đồng ý với các điều khoản về giá cả, thanh toán, vận chuyển và đổi trả được quy định tại các trang chính sách liên quan.",
  },
];

export function getPolicyBySlug(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}
