import Link from 'next/link';

const SECTIONS = [
  {
    href: '/products',
    title: 'Sản phẩm',
    description: 'Thêm, sửa, xoá sản phẩm và quản lý giá theo từng quy cách đóng gói.',
  },
  {
    href: '/categories',
    title: 'Danh mục',
    description: 'Quản lý các nhóm trái cây hiển thị trên website.',
  },
  {
    href: '/posts',
    title: 'Bài viết',
    description: 'Quản lý bài viết ở mục Tin tức trên website.',
  },
];

export default function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
      <p className="mt-1 text-slate-600">Chọn một mục bên dưới để bắt đầu cập nhật nội dung website.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="font-semibold text-slate-900">{section.title}</p>
            <p className="mt-1 text-sm text-slate-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
