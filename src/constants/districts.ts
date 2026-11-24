// Districts are stored as stable slugs ("hyderabad") in the database and
// translated only at display time, so the data never depends on the UI language.
export const DISTRICTS = ['hyderabad', 'vijayawada', 'visakhapatnam'] as const;

export type DistrictId = (typeof DISTRICTS)[number];

export const DEFAULT_DISTRICT: DistrictId = 'hyderabad';

export function isDistrictId(value: unknown): value is DistrictId {
  return typeof value === 'string' && (DISTRICTS as readonly string[]).includes(value);
}
