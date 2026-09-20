export function CallButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="tel:0934568196"
        className="flex items-center gap-2 bg-accent-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-accent-900/20 transition-colors hover:bg-accent-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" />
        </svg>
        Gọi ngay
      </a>
    </div>
  );
}
