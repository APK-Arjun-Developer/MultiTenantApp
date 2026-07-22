import { alpha } from '@mui/material/styles';

import type { Sx } from '@/types';

// Trigger icon button in AppBar
const triggerButtonSx: Sx = { color: 'text.secondary' };

// Popover paper sizing
const popoverPaperSx: Sx = { mt: 1, p: 2, width: 212 };

// Section heading ("Color" / "Mode")
const sectionLabelSx: Sx = {
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'text.secondary',
  display: 'block',
  mb: 1,
};

// Color swatch row
const colorGridSx: Sx = { display: 'flex', gap: 1, flexWrap: 'wrap' };

// Color swatch circle button (dynamic: hex color + selected state)
const colorSwatchSx = (primaryColor: string, isSelected: boolean): Sx => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  background: primaryColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: isSelected ? `2px solid ${primaryColor}` : '2px solid transparent',
  outlineOffset: 2,
  transition: 'transform 0.15s, outline 0.15s',
  '&:hover': { transform: 'scale(1.15)' },
  p: 0,
});

// Checkmark icon inside the active swatch
const swatchCheckSx: Sx = { fontSize: 14, color: '#fff' };

// Divider between Color and Mode sections
const dividerSx: Sx = { my: 1.5 };

// Mode buttons row
const modeGridSx: Sx = { display: 'flex', gap: 1 };

// Mode toggle button (dynamic: active state)
const modeButtonSx = (isActive: boolean): Sx => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.75,
  py: 0.875,
  px: 1,
  borderRadius: 1.5,
  border: '1px solid',
  borderColor: isActive ? 'primary.main' : 'divider',
  background: isActive ? alpha('#808080', 0.08) : 'transparent',
  cursor: 'pointer',
  color: isActive ? 'primary.main' : 'text.secondary',
  fontSize: '0.8125rem',
  fontWeight: isActive ? 600 : 400,
  transition: 'all 0.15s',
  '&:hover': { borderColor: 'primary.main' },
  p: 0,
});

// Sun/Moon icon inside the mode button
const modeIconSx: Sx = { fontSize: 15 };

export {
  colorGridSx,
  colorSwatchSx,
  dividerSx,
  modeButtonSx,
  modeGridSx,
  modeIconSx,
  popoverPaperSx,
  sectionLabelSx,
  swatchCheckSx,
  triggerButtonSx,
};
