import { Suspense } from "react";
import { PreviewClient } from "./preview-client";

export const metadata = { title: "Xem trước & sửa" };

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewClient />
    </Suspense>
  );
}
