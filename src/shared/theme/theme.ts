import { createTheme } from '@mui/material/styles';

export function buildTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      background: {
        default: isDark ? '#0f1117' : '#f5f7fa',
        paper: isDark ? '#1a1d27' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.palette.action.disabled} transparent`,
          },
          '*::-webkit-scrollbar': {
            width: 2,
            height: 2,
          },
          '*::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.action.disabled,
            borderRadius: 3,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.action.active,
          },
        }),
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
        styleOverrides: {
          root: {
            input: {
              padding: '10px 12px',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            padding: '10px 12px',
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          // Normalize height to match MuiTextField size="small" (padding: 10px 12px)
          inputRoot: {
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
          },
          input: {
            padding: '10px 4px !important',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
    },
  });
}
