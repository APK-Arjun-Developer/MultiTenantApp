import { alpha, type Theme } from '@mui/material/styles';

import type { Sx } from '@/types';

// Factory for the gradient icon boxes used in page headers, auth forms, and brand marks.
// Returns a theme callback so the box always follows the active color preset.
const themedIconBoxSx =
  (size: number, borderRadius: number, shadowBlur: number, shadowOpacity: number) =>
  (t: Theme) => ({
    width: size,
    height: size,
    borderRadius,
    background: `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: `0 0 ${shadowBlur}px ${alpha(t.palette.primary.main, shadowOpacity)}`,
  });

// 32×32 — standard list-page header icon (Users, Roles, Tenants, etc.)
const pageIconBoxSx: Sx = themedIconBoxSx(32, 1.5, 12, 0.3);

// 36×36 — larger hero icon (Dashboard welcome, Settings page)
const pageLargeIconBoxSx: Sx = themedIconBoxSx(36, 2, 16, 0.35);

// 28×28 — compact icon for auth page form headers
const pageSmallIconBoxSx: Sx = themedIconBoxSx(28, 1.25, 10, 0.28);

// Standard flex row for page header: gradient icon on the left, title text on the right
const headerTitleSx: Sx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
};

export { headerTitleSx, pageIconBoxSx, pageLargeIconBoxSx, pageSmallIconBoxSx, themedIconBoxSx };
