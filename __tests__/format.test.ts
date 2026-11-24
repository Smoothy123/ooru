import i18n from '@/i18n';
import { formatIndianNumber, formatPrice, formatTimeAgo } from '@/utils/format';

const t = i18n.t.bind(i18n);

describe('formatIndianNumber', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1,000'],
    [62000, '62,000'],
    [135000, '1,35,000'],
    [1234567, '12,34,567'],
    [10000000, '1,00,00,000'],
  ])('formats %d as %s', (input, expected) => {
    expect(formatIndianNumber(input)).toBe(expected);
  });
});

describe('formatPrice', () => {
  it('shows "Free" for zero and rupees otherwise', () => {
    expect(formatPrice(0, t)).toBe('Free');
    expect(formatPrice(18000, t)).toBe('₹18,000');
  });
});

describe('formatTimeAgo', () => {
  const now = new Date('2026-11-24T12:00:00Z').getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it('uses the largest sensible unit', () => {
    expect(formatTimeAgo(ago(20 * 1000), t, now)).toBe('just now');
    expect(formatTimeAgo(ago(5 * 60 * 1000), t, now)).toBe('5 min ago');
    expect(formatTimeAgo(ago(3 * 60 * 60 * 1000), t, now)).toBe('3 h ago');
    expect(formatTimeAgo(ago(2 * 24 * 60 * 60 * 1000), t, now)).toBe('2 d ago');
  });

  it('uses the singular for one day in Telugu', () => {
    const te = i18n.getFixedT('te');
    expect(formatTimeAgo(ago(26 * 60 * 60 * 1000), te, now)).toBe('1 రోజు క్రితం');
    expect(formatTimeAgo(ago(2 * 24 * 60 * 60 * 1000), te, now)).toBe('2 రోజుల క్రితం');
    expect(formatTimeAgo(ago(26 * 60 * 60 * 1000), t, now)).toBe('1 d ago');
  });

  it('falls back to a date after 30 days', () => {
    expect(formatTimeAgo('2026-09-01T10:00:00Z', t, now)).toBe('1/9/2026');
  });
});
