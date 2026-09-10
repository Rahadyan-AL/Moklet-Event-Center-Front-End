// Design Tokens — Moklet Event Center
// Gunakan file ini sebagai satu-satunya sumber kebenaran untuk warna, spacing, dll.

export const Colors = {
  primary: '#C62828',
  primaryDark: '#B71C1C',
  primaryLight: '#FFEBEE',
  primarySoft: 'rgba(198, 40, 40, 0.08)',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  textMain: '#0F172A',
  textSecondary: '#334155',
  textSubtitle: '#64748B',
  textPlaceholder: '#94A3B8',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  black: '#000000',
  divider: '#F1F5F9',
  border: '#E2E8F0',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  overlay: 'rgba(15, 23, 42, 0.5)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;

export const Typography = {
  displayLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textMain,
    lineHeight: 36,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textMain,
    lineHeight: 28,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textMain,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSubtitle,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSubtitle,
    lineHeight: 20,
  },
} as const;
