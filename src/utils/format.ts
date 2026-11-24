import type { TFunction } from 'i18next';

/**
 * Indian digit grouping: the last 3 digits, then groups of 2.
 * 120000 -> "1,20,000", 1234567 -> "12,34,567".
 * Written by hand so it doesn't depend on Intl support in the JS engine.
 */
export function formatIndianNumber(value: number): string {
  const digits = String(Math.round(Math.abs(value)));
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${lastThree}`;
}

export function formatPrice(price: number, t: TFunction): string {
  return price === 0 ? t('post.free') : `₹${formatIndianNumber(price)}`;
}

/**
 * "just now", "5 min ago", "3 h ago", "2 d ago", then a plain date.
 * `now` is a parameter so tests can pass a fixed time.
 */
export function formatTimeAgo(isoDate: string, t: TFunction, now: number = Date.now()): string {
  const date = new Date(isoDate);
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  if (minutes < 1) return t('time.justNow');
  if (minutes < 60) return t('time.minutesAgo', { n: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { n: hours });

  const days = Math.floor(hours / 24);
  if (days < 30) return t('time.daysAgo', { n: days });

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
