import type { Metadata } from "next";
import { formatPhone } from "@frozen-fruit-shop/types";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/contact/contact-form";
import { getSettings } from "@/lib/api";
import { getMapEmbedUrl } from "@/lib/map-embed";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ và form hỗ trợ khách hàng.",
};

const linkClass = "font-semibold text-accent-700 hover:underline";
/** Khung trắng bo góc giống các khối ở trang chủ (SectionCard). */
const cardClass = "rounded-2xl border border-divider bg-card p-5 shadow-sm sm:p-7";

export default async function ContactPage() {
  const settings = await getSettings();
  // Bản đồ lấy theo link Google Maps trong Cài đặt (ghim đúng cửa hàng); không có link thì theo địa chỉ.
  const mapEmbedUrl = await getMapEmbedUrl(settings.mapUrl, settings.address);

  return (
    <Container className="py-12">
      <SectionHeading as="h1" eyebrow="Liên hệ" title="Chúng tôi luôn sẵn sàng hỗ trợ" />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={cardClass} aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="mb-5 text-lg font-bold text-foreground">
            Gửi tin nhắn cho cửa hàng
          </h2>
          <ContactForm />
        </section>

        <div className="flex flex-col gap-6">
          {/* Hai khung bên phải giãn đều để mép dưới thẳng hàng với khung form bên trái. */}
          <section className={`${cardClass} lg:flex-1`}>
            <h2 className="text-lg font-bold text-foreground">Thông tin liên hệ</h2>
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
                <li className="[overflow-wrap:anywhere]">
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
          </section>

          {settings.address ? (
            <section className={`${cardClass} lg:flex-1`}>
              <h2 className="text-lg font-bold text-foreground">Địa chỉ cửa hàng</h2>
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
            </section>
          ) : null}
        </div>
      </div>

      {mapEmbedUrl ? (
        <section className={`${cardClass} mt-6`} aria-labelledby="map-heading">
          <h2 id="map-heading" className="mb-4 text-lg font-bold text-foreground">
            Bản đồ đến cửa hàng
          </h2>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface sm:aspect-[21/9]">
            <iframe
              title={`Bản đồ đến ${settings.storeName}`}
              src={mapEmbedUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}
    </Container>
  );
}
