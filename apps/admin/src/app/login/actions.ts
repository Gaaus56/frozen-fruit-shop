'use server';

import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { setToken } from '@/lib/session';

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    return { error: 'Email hoặc mật khẩu không đúng.' };
  }

  const data = (await res.json()) as { accessToken: string };
  await setToken(data.accessToken);
  redirect('/');
}
