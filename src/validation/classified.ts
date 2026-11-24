import type { DistrictId } from '@/constants/districts';
import type { NewClassified, PickedPhoto } from '@/types/post';

/** The form exactly as the user typed it (price is still text). */
export interface ClassifiedForm {
  title: string;
  description: string;
  price: string;
  district: DistrictId;
  authorName: string;
  photo: PickedPhoto | null;
}

export type ClassifiedField = 'title' | 'description' | 'price' | 'authorName' | 'photo';

/** Field -> i18n key of the message to show. A field with no entry is valid. */
export type ClassifiedErrors = Partial<Record<ClassifiedField, string>>;

// Also passed to t() so messages like "at least {{titleMin}} characters" stay in sync.
// Kept a little stricter than the database CHECK constraints in supabase/schema.sql.
export const LIMITS = {
  titleMin: 5,
  titleMax: 80,
  descriptionMin: 10,
  descriptionMax: 1000,
  nameMin: 2,
  nameMax: 40,
  priceMax: 10_000_000, // ₹1 crore
  photoMaxBytes: 5 * 1024 * 1024, // matches the storage bucket's limit
};

function checkLength(
  value: string,
  min: number,
  max: number,
  keys: { required: string; tooShort: string; tooLong: string },
) {
  if (value.length === 0) return keys.required;
  if (value.length < min) return keys.tooShort;
  if (value.length > max) return keys.tooLong;
  return undefined;
}

/** "1,20,000 " -> "120000". People often type Indian-style commas. */
function normalisePrice(raw: string): string {
  return raw.trim().replace(/,/g, '');
}

/**
 * A pure function: form in, errors out. No React, no network, which makes it
 * trivial to unit test and reuse.
 */
export function validateClassified(form: ClassifiedForm): ClassifiedErrors {
  const errors: ClassifiedErrors = {};

  const title = checkLength(form.title.trim(), LIMITS.titleMin, LIMITS.titleMax, {
    required: 'errors.titleRequired',
    tooShort: 'errors.titleTooShort',
    tooLong: 'errors.titleTooLong',
  });
  if (title) errors.title = title;

  const description = checkLength(form.description.trim(), LIMITS.descriptionMin, LIMITS.descriptionMax, {
    required: 'errors.descriptionRequired',
    tooShort: 'errors.descriptionTooShort',
    tooLong: 'errors.descriptionTooLong',
  });
  if (description) errors.description = description;

  const price = normalisePrice(form.price);
  if (price.length === 0) errors.price = 'errors.priceRequired';
  else if (!/^\d+$/.test(price)) errors.price = 'errors.priceInvalid';
  else if (Number(price) > LIMITS.priceMax) errors.price = 'errors.priceTooHigh';

  const name = checkLength(form.authorName.trim(), LIMITS.nameMin, LIMITS.nameMax, {
    required: 'errors.nameRequired',
    tooShort: 'errors.nameTooShort',
    tooLong: 'errors.nameTooLong',
  });
  if (name) errors.authorName = name;

  if (form.photo?.fileSize !== undefined && form.photo.fileSize > LIMITS.photoMaxBytes) {
    errors.photo = 'errors.photoTooLarge';
  }

  return errors;
}

export function hasErrors(errors: ClassifiedErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Converts a valid form into what the API expects (trimmed text, numeric price). */
export function toNewClassified(form: ClassifiedForm, imageUrl: string | null): NewClassified {
  return {
    district: form.district,
    title: form.title.trim(),
    body: form.description.trim(),
    price: Number(normalisePrice(form.price)),
    imageUrl,
    authorName: form.authorName.trim(),
  };
}
