"use client";

/** Lỗi ngay ở layout gốc (hiếm): thay cả trang nên tự có <html>/<body> và kiểu viết thẳng. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#eef2f6", color: "#201e1d" }}>
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#cf2a10", margin: 0 }}>Có lỗi xảy ra</p>
          <p style={{ color: "#6b6765" }}>Website đang gặp sự cố tạm thời. Bạn vui lòng thử lại sau ít phút.</p>
          {error.digest ? <p style={{ fontSize: 12, color: "#8a8683" }}>Mã lỗi: {error.digest}</p> : null}
          <button type="button" onClick={() => retry()} style={{ marginTop: 8, padding: "12px 24px", border: 0, borderRadius: 9999, background: "#cf2a10", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
