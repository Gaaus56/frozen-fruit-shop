'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiMutate } from '@/lib/api';

export interface BlogPostFormState {
  error?: string;
}

function buildPayload(formData: FormData) {
  return {
    slug: String(formData.get('slug') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    coverImage: String(formData.get('coverImage') ?? '').trim(),
    excerpt: String(formData.get('excerpt') ?? '').trim(),
    content: String(formData.get('content') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    publishedAt: new Date(String(formData.get('publishedAt'))).toISOString(),
  };
}

export async function createBlogPostAction(
  _prevState: BlogPostFormState | undefined,
  formData: FormData,
): Promise<BlogPostFormState> {
  try {
    await apiMutate('/blog-posts', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại.' };
  }

  revalidatePath('/bai-viet');
  redirect('/bai-viet');
}

export async function updateBlogPostAction(
  slug: string,
  _prevState: BlogPostFormState | undefined,
  formData: FormData,
): Promise<BlogPostFormState> {
  try {
    await apiMutate(`/blog-posts/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại.' };
  }

  revalidatePath('/bai-viet');
  redirect('/bai-viet');
}

export async function deleteBlogPostAction(slug: string) {
  await apiMutate(`/blog-posts/${slug}`, { method: 'DELETE' });
  revalidatePath('/bai-viet');
}
