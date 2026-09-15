'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiMutate } from '@/lib/api';

export interface ProductFormState {
  error?: string;
}

function splitLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitCommaList(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPayload(formData: FormData) {
  const variantsJson = String(formData.get('variantsJson') ?? '[]');
  let variants: unknown;
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    variants = [];
  }

  return {
    slug: String(formData.get('slug') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    categorySlug: String(formData.get('categorySlug') ?? '').trim(),
    images: splitLines(formData.get('images')),
    shortDescription: String(formData.get('shortDescription') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    storageInfo: {
      temperature: String(formData.get('temperature') ?? '').trim(),
      shelfLifeDays: Number(formData.get('shelfLifeDays') ?? 0),
      thawInstructions: String(formData.get('thawInstructions') ?? '').trim(),
    },
    tags: splitCommaList(formData.get('tags')),
    isWholesaleAvailable: formData.get('isWholesaleAvailable') === 'on',
    relatedProductIds: splitCommaList(formData.get('relatedProductIds')),
    variants,
  };
}

export async function createProductAction(
  _prevState: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  const payload = buildPayload(formData);
  if (!Array.isArray(payload.variants) || payload.variants.length === 0) {
    return { error: 'Cần ít nhất một quy cách đóng gói (biến thể).' };
  }

  try {
    await apiMutate('/products', { method: 'POST', body: JSON.stringify(payload) });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại.' };
  }

  revalidatePath('/san-pham');
  redirect('/san-pham');
}

export async function updateProductAction(
  slug: string,
  _prevState: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  const payload = buildPayload(formData);
  if (!Array.isArray(payload.variants) || payload.variants.length === 0) {
    return { error: 'Cần ít nhất một quy cách đóng gói (biến thể).' };
  }

  try {
    await apiMutate(`/products/${slug}`, { method: 'PATCH', body: JSON.stringify(payload) });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại.' };
  }

  revalidatePath('/san-pham');
  redirect('/san-pham');
}

export async function deleteProductAction(slug: string) {
  await apiMutate(`/products/${slug}`, { method: 'DELETE' });
  revalidatePath('/san-pham');
}
