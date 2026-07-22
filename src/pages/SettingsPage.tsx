import { memo } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
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
  colorSwatchCheckSx,
  colorSwatchSx,
  modeCardSx,
  modeCheckIconSx,
  modeIconBoxSx,
  modeLabelSx,
  pageIconBoxSx,
  pageIconSx,
  styles,
} from './SettingsPage.styles';

const COLOR_ORDER: ThemeColor[] = ['violet', 'blue', 'green', 'rose', 'amber', 'teal'];

const MODES: { value: ThemeMode; label: string; icon: 'Brightness7' | 'Brightness4' }[] = [
  { value: 'light', label: 'Light', icon: 'Brightness7' },
  { value: 'dark', label: 'Dark', icon: 'Brightness4' },
];

const SettingsPage = memo(() => {
  const dispatch = useAppDispatch();
  const themeColor = useAppSelector(selectThemeColor);
  const themeMode = useAppSelector(selectThemeMode);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.pageHeader}>
        <Box sx={pageIconBoxSx}>
          <Icon name="Settings" sx={pageIconSx} />
        </Box>
        <Typography variant="h5" sx={styles.pageTitle}>
          Settings
        </Typography>
      </Box>

      <Paper variant="outlined" sx={styles.sectionPaper}>
        <Typography variant="h6" sx={styles.sectionTitle}>
          Appearance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.sectionSubtitle}>
          Customize how the application looks on your device.
        </Typography>

        <Typography variant="subtitle2" sx={styles.subsectionLabel}>
          Color Theme
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.subsectionHint}>
          Choose an accent color for the interface.
        </Typography>

        <Box sx={styles.colorGrid}>
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
                  {isSelected && <Icon name="Check" sx={colorSwatchCheckSx} />}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        <Divider sx={styles.divider} />

        <Typography variant="subtitle2" sx={styles.subsectionLabel}>
          Display Mode
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={styles.subsectionHint}>
          Choose between light and dark interface.
        </Typography>

        <Box sx={styles.modeGrid}>
          {MODES.map(({ value, label, icon }) => {
            const isActive = themeMode === value;
            return (
              <Box
                key={value}
                component="button"
                onClick={() => dispatch(setThemeMode(value))}
                aria-label={`${label} mode`}
                aria-pressed={isActive}
                sx={modeCardSx(isActive)}
              >
                <Box sx={modeIconBoxSx(isActive)}>
                  <Icon name={icon} />
                </Box>
                <Typography variant="body2" sx={modeLabelSx(isActive)}>
                  {label}
                </Typography>
                {isActive && <Icon name="Check" sx={modeCheckIconSx} />}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
});

export default SettingsPage;
