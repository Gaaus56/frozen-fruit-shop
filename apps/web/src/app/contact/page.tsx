import type { Metadata } from "next";
import { formatPhone } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/contact/contact-form";
import { getSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ và form hỗ trợ khách hàng.",
};

const linkClass = "font-semibold text-accent-700 hover:underline";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <Container className="py-12">
      <SectionHeading eyebrow="Liên hệ" title="Chúng tôi luôn sẵn sàng hỗ trợ" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div className="border border-divider p-6">
            <p className="font-semibold text-foreground">Thông tin liên hệ</p>
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              <li>
                Hotline{settings.hotlineHours ? ` ${settings.hotlineHours}` : ""}:{" "}
                <a href={`tel:${settings.phone}`} className={linkClass}>{formatPhone(settings.phone)}</a>
              </li>
              {settings.zaloPhone ? (
                <li>
                  Zalo:{" "}
                  <a href={`https://zalo.me/${settings.zaloPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {formatPhone(settings.zaloPhone)}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li>
                  Email: <a href={`mailto:${settings.email}`} className={linkClass}>{settings.email}</a>
                </li>
              ) : null}
              {settings.facebookUrl ? (
                <li>
                  Facebook:{" "}
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {settings.storeName}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          {settings.address ? (
            <div className="border border-divider p-6">
              <p className="font-semibold text-foreground">Địa chỉ cửa hàng</p>
              <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                <li>{settings.address}</li>
                {settings.addressLandmark ? <li>{settings.addressLandmark}</li> : null}
                {settings.mapUrl ? (
                  <li>
                    <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Xem bản đồ chỉ đường
                    </a>
                  </li>
                ) : null}
                {settings.taxCode ? (
                  <li>
                    MST {settings.taxCode}
                    {settings.taxNote ? ` — ${settings.taxNote}` : ""}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
