'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiMutate } from '@/lib/api';

export interface CategoryFormState {
  error?: string;
}

function buildPayload(formData: FormData) {
  return {
    slug: String(formData.get('slug') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    image: String(formData.get('image') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
  };
}

export async function createCategoryAction(
  _prevState: CategoryFormState | undefined,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await apiMutate('/categories', {
      method: 'POST',
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại.' };
  }

  revalidatePath('/categories');
  redirect('/categories');
}

export async function updateCategoryAction(
  slug: string,
  _prevState: CategoryFormState | undefined,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await apiMutate(`/categories/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(buildPayload(formData)),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại.' };
  }

  revalidatePath('/categories');
  redirect('/categories');
}

export async function deleteCategoryAction(slug: string) {
  await apiMutate(`/categories/${slug}`, { method: 'DELETE' });
  revalidatePath('/categories');
}
