// One place for colours and spacing so screens stay consistent.
// Text/background pairs were picked to meet WCAG AA contrast (4.5:1).
export const colors = {
  primary: '#0E7C66',
  primaryPressed: '#0A5C4C',
  onPrimary: '#FFFFFF',
  background: '#F6F4EF',
  surface: '#FFFFFF',
  text: '#1D2125',
  textMuted: '#5F656D',
  border: '#E3DFD6',
  news: '#1D4ED8',
  newsBg: '#E0EAFF',
  classified: '#9A4A00',
  classifiedBg: '#FFEBD2',
  danger: '#B42318',
  warningBg: '#FFF4D6',
  warningText: '#6B4E00',
  backdrop: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  pill: 999,
};

/** Android's recommended minimum touch target. */
export const MIN_TOUCH_SIZE = 48;
