import { alpha, type Theme } from '@mui/material/styles';

import { pageLargeIconBoxSx } from '@/shared/theme/styleHelpers';
import type { StyleSheet, Sx } from '@/types';

const styles = {
  root: {
    pb: 4,
    maxWidth: 640,
  },

  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 3,
  },

  pageTitle: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },

  sectionPaper: {
    p: 3,
  },

  sectionTitle: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
    mb: 0.5,
  },

  sectionSubtitle: {
    mb: 2.5,
  },

  divider: {
    my: 3,
  },

  subsectionLabel: {
    fontWeight: 600,
    mb: 0.5,
  },

  subsectionHint: {
    mb: 2,
  },

  colorGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1.5,
  },

  modeGrid: {
    display: 'flex',
    gap: 1.5,
    flexWrap: 'wrap',
  },
} as const satisfies StyleSheet;

// 36×36 page icon box — shared large variant
const pageIconBoxSx: Sx = pageLargeIconBoxSx;

// Icon inside the page icon box
const pageIconSx: Sx = { fontSize: '1.125rem' };

// Check icon inside a color swatch button
const colorSwatchCheckSx: Sx = { fontSize: 18, color: '#fff' };

// Color swatch circle button — outline reflects selected state
const colorSwatchSx = (primaryColor: string, isSelected: boolean): Sx => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  background: primaryColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: isSelected ? `3px solid ${primaryColor}` : '3px solid transparent',
  outlineOffset: 3,
  transition: 'transform 0.15s, outline 0.15s',
  '&:hover': { transform: 'scale(1.12)' },
  p: 0,
  flexShrink: 0,
});

// Mode card button — border + text color follow active state
const modeCardSx = (isActive: boolean): Sx => ({
  flex: '1 1 140px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
  py: 2.5,
  px: 2,
  borderRadius: 2,
  border: '2px solid',
  cursor: 'pointer',
  transition: 'all 0.15s',
  background: 'transparent',
  borderColor: isActive ? 'primary.main' : 'divider',
  color: isActive ? 'primary.main' : 'text.secondary',
  '&:hover': { borderColor: 'primary.main' },
});

// Mode icon circle — tinted background + icon color when active (needs theme for alpha)
const modeIconBoxSx =
  (isActive: boolean): Sx =>
  (t: Theme) => ({
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': { fontSize: '1.375rem' },
    background: isActive ? alpha(t.palette.primary.main, 0.12) : t.palette.action.hover,
    color: isActive ? t.palette.primary.main : t.palette.text.secondary,
  });

// Mode label typography
const modeLabelSx = (isActive: boolean): Sx => ({
  fontWeight: isActive ? 600 : 400,
  color: 'inherit',
});

// Active-mode checkmark icon
const modeCheckIconSx: Sx = {
  fontSize: 16,
  color: 'primary.main',
  mt: -0.5,
};

export {
  colorSwatchCheckSx,
  colorSwatchSx,
  modeCardSx,
  modeCheckIconSx,
  modeIconBoxSx,
  modeLabelSx,
  pageIconBoxSx,
  pageIconSx,
  styles,
};
