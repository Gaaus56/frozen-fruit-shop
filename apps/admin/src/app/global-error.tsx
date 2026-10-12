"use client";

/** Lỗi ngay ở layout gốc (hiếm): thay cả trang nên tự có <html>/<body> và kiểu viết thẳng. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#f5f4f3", color: "#201e1d" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 40, fontWeight: 800, color: "#cf2a10", margin: 0 }}>Có lỗi xảy ra</p>
          <p style={{ color: "#6b6765" }}>Trang quản trị gặp sự cố. Vui lòng thử lại sau ít phút.</p>
          {error.digest ? <p style={{ fontSize: 12, color: "#8a8683" }}>Mã lỗi: {error.digest}</p> : null}
          <button type="button" onClick={() => retry()} style={{ marginTop: 8, padding: "10px 20px", border: 0, background: "#cf2a10", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
