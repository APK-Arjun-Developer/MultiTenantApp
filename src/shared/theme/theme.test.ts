import { describe, expect, it } from 'vitest';

import { buildTheme, THEME_PRESETS, type ThemeColor } from '.';

const COLORS = Object.keys(THEME_PRESETS) as ThemeColor[];

describe('buildTheme', () => {
  it.each(COLORS)('uses the %s preset as the primary color in both modes', (color) => {
    for (const mode of ['light', 'dark'] as const) {
      const theme = buildTheme(mode, color);

      expect(theme.palette.mode).toBe(mode);
      expect(theme.palette.primary.main).toBe(THEME_PRESETS[color].primary.main);
    }
  });

  it('defaults to the violet preset', () => {
    expect(buildTheme('light').palette.primary.main).toBe(THEME_PRESETS.violet.primary.main);
  });

  it('uses dark surfaces and light text in dark mode', () => {
    const light = buildTheme('light');
    const dark = buildTheme('dark');

    expect(dark.palette.background.default).not.toBe(light.palette.background.default);
    expect(dark.palette.background.paper).not.toBe(light.palette.background.paper);
    expect(dark.palette.text.primary).not.toBe(light.palette.text.primary);
    expect(dark.palette.divider).not.toBe(light.palette.divider);
  });
});
