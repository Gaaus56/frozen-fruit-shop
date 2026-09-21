import Link from 'next/link';
import { logoutAction } from '@/lib/auth-actions';

const NAV_LINKS = [
  { href: '/', label: 'Tổng quan' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/categories', label: 'Danh mục' },
  { href: '/posts', label: 'Bài viết' },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <p className="font-extrabold uppercase tracking-tight text-emerald-600">Trái Cây Đông Lạnh 28</p>
        <p className="text-xs text-slate-500">Trang quản trị</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <form action={logoutAction} className="border-t border-slate-200 p-3">
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          Đăng xuất
        </button>
      </form>
    </aside>
  );
}
