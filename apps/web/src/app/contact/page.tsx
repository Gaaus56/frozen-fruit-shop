import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/contact/contact-form";
import { business } from "@/data/business";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Thông tin liên hệ và form hỗ trợ khách hàng của ${business.name}.`,
};

export default function ContactPage() {
  return (
    <Container className="py-12">
      <SectionHeading eyebrow="Liên hệ" title="Chúng tôi luôn sẵn sàng hỗ trợ" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div className="rounded-none border border-divider p-6">
            <p className="font-semibold text-foreground">Thông tin liên hệ</p>
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              <li>Hotline {business.hotlineHours}: {business.phoneDisplay}</li>
              <li>Zalo: {business.phoneDisplay}</li>
              <li>Email: {business.email}</li>
              <li>
                Facebook:{" "}
                <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-700 hover:underline">
                  Trái cây đông lạnh Đà Nẵng
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-none border border-divider p-6">
            <p className="font-semibold text-foreground">Địa chỉ</p>
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              <li>{business.address}</li>
              <li>{business.addressLandmark}</li>
              <li>
                <a href={business.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-700 hover:underline">
                  Xem bản đồ
                </a>
              </li>
              <li>MST {business.taxCode} — {business.taxNote}</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}
