import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ và form hỗ trợ khách hàng của Frozen Fruit Shop.",
};

export default function ContactPage() {
  return (
    <Container className="py-12">
      <SectionHeading eyebrow="Liên hệ" title="Chúng tôi luôn sẵn sàng hỗ trợ" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="font-semibold text-slate-900">Thông tin liên hệ</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Hotline: 0900 000 000</li>
              <li>Email: hello@frozenfruitshop.vn</li>
              <li>Zalo: 0900 000 000</li>
              <li>Giờ hỗ trợ: 8:00 – 20:00, tất cả các ngày trong tuần</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <p className="font-semibold text-slate-900">Địa chỉ</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>TP. Hồ Chí Minh: đang cập nhật</li>
              <li>Đà Nẵng: đang cập nhật</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}
