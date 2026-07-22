import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectThemeColor,
  selectThemeMode,
  setThemeColor,
  setThemeMode,
} from '@/features/ui/uiSlice';
import { Icon } from '@/shared/components';
import { THEME_PRESETS, type ThemeColor, type ThemeMode } from '@/shared/theme';

import {
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
} from './styles';

const COLOR_ORDER: ThemeColor[] = ['violet', 'blue', 'green', 'rose', 'amber', 'teal'];

const ThemePicker = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const themeColor = useAppSelector(selectThemeColor);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Theme">
        <IconButton onClick={handleOpen} size="small" sx={triggerButtonSx}>
          <Icon name="Palette" fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: popoverPaperSx } }}
      >
        <Typography variant="caption" sx={sectionLabelSx}>
          Color
        </Typography>

        <Box sx={colorGridSx}>
          {COLOR_ORDER.map((color) => {
            const preset = THEME_PRESETS[color];
            const isSelected = themeColor === color;
            return (
              <Tooltip key={color} title={preset.label} placement="top">
                <Box
                  component="button"
                  onClick={() => dispatch(setThemeColor(color))}
                  aria-label={preset.label}
                  aria-pressed={isSelected}
                  sx={colorSwatchSx(preset.primary.main, isSelected)}
                >
                  {isSelected && <Icon name="Check" sx={swatchCheckSx} />}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        <Divider sx={dividerSx} />

        <Typography variant="caption" sx={sectionLabelSx}>
          Mode
        </Typography>

        <Box sx={modeGridSx}>
          {(['light', 'dark'] as ThemeMode[]).map((mode) => {
            const isActive = themeMode === mode;
            return (
              <Box
                key={mode}
                component="button"
                onClick={() => dispatch(setThemeMode(mode))}
                aria-label={`${mode} mode`}
                aria-pressed={isActive}
                sx={modeButtonSx(isActive)}
              >
                <Icon name={mode === 'light' ? 'Brightness7' : 'Brightness4'} sx={modeIconSx} />
                {mode === 'light' ? 'Light' : 'Dark'}
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

export default ThemePicker;
