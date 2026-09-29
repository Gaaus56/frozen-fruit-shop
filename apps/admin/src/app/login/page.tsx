'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Trái Cây Đông Lạnh Đà Nẵng 28</h1>
        <p className="mt-1 text-sm text-slate-500">Đăng nhập trang quản trị</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 inline-flex items-center justify-center  bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
          >
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
