import { alpha, createTheme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';
type ThemeColor = 'violet' | 'blue' | 'green' | 'rose' | 'amber' | 'teal';

interface ThemePreset {
  label: string;
  primary: { main: string; light: string; dark: string };
  secondary: { main: string; light: string; dark: string };
}

const THEME_PRESETS: Record<ThemeColor, ThemePreset> = {
  violet: {
    label: 'Violet',
    primary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
    secondary: { main: '#06B6D4', light: '#67E8F9', dark: '#0891B2' },
  },
  blue: {
    label: 'Blue',
    primary: { main: '#2563EB', light: '#60A5FA', dark: '#1D4ED8' },
    secondary: { main: '#10B981', light: '#6EE7B7', dark: '#059669' },
  },
  green: {
    label: 'Green',
    primary: { main: '#16A34A', light: '#4ADE80', dark: '#166534' },
    secondary: { main: '#0284C7', light: '#38BDF8', dark: '#0369A1' },
  },
  rose: {
    label: 'Rose',
    primary: { main: '#E11D48', light: '#FB7185', dark: '#9F1239' },
    secondary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
  },
  amber: {
    label: 'Amber',
    primary: { main: '#D97706', light: '#FCD34D', dark: '#92400E' },
    secondary: { main: '#0284C7', light: '#38BDF8', dark: '#0369A1' },
  },
  teal: {
    label: 'Teal',
    primary: { main: '#0D9488', light: '#2DD4BF', dark: '#115E59' },
    secondary: { main: '#8B5CF6', light: '#C4B5FD', dark: '#6D28D9' },
  },
};

// Zinc — warm dark neutral scale
const zinc = {
  50: '#FAFAFA',
  100: '#F4F4F5',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
  950: '#09090B',
} as const;

const buildTheme = (mode: ThemeMode, color: ThemeColor = 'violet') => {
  const isDark = mode === 'dark';
  const preset = THEME_PRESETS[color];
  const { primary, secondary } = preset;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primary.main,
        light: primary.light,
        dark: primary.dark,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: secondary.main,
        light: secondary.light,
        dark: secondary.dark,
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? zinc[950] : zinc[100],
        paper: isDark ? zinc[900] : '#FFFFFF',
      },
      text: {
        primary: isDark ? zinc[50] : zinc[900],
        secondary: isDark ? zinc[400] : zinc[500],
        disabled: isDark ? zinc[600] : zinc[400],
      },
      divider: isDark ? zinc[800] : zinc[200],
      success: {
        main: '#22C55E',
        dark: '#16A34A',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#EAB308',
        dark: '#CA8A04',
        contrastText: isDark ? zinc[950] : '#FFFFFF',
      },
      error: {
        main: '#EF4444',
        dark: '#DC2626',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#06B6D4',
        dark: '#0891B2',
        contrastText: '#FFFFFF',
      },
      grey: {
        50: zinc[50],
        100: zinc[100],
        200: zinc[200],
        300: zinc[300],
        400: zinc[400],
        500: zinc[500],
        600: zinc[600],
        700: zinc[700],
        800: zinc[800],
        900: zinc[900],
      },
      action: {
        hover: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        selected: alpha(primary.main, isDark ? 0.18 : 0.1),
        disabledBackground: isDark ? zinc[800] : zinc[200],
        disabled: isDark ? zinc[600] : zinc[400],
      },
    },

    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.015em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, letterSpacing: '-0.005em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600, fontSize: '0.9375rem' },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
      body1: { fontSize: '0.9375rem' },
      body2: { fontSize: '0.875rem' },
      caption: { fontSize: '0.75rem' },
    },

    shape: { borderRadius: 8 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${isDark ? zinc[700] : zinc[300]} transparent`,
          },
          '*::-webkit-scrollbar': { width: 4, height: 4 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? zinc[700] : zinc[300],
            borderRadius: 4,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: isDark ? zinc[600] : zinc[400],
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? zinc[950] : '#FFFFFF',
            backgroundImage: 'none',
            borderBottom: `1px solid ${isDark ? zinc[800] : zinc[200]}`,
            boxShadow: 'none',
            color: isDark ? zinc[50] : zinc[900],
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? zinc[950] : '#FFFFFF',
            backgroundImage: 'none',
            borderRight: `1px solid ${isDark ? zinc[800] : zinc[200]}`,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: isDark ? zinc[800] : zinc[200],
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundImage: 'none',
            border: `1px solid ${isDark ? zinc[800] : zinc[200]}`,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            backgroundImage: 'none',
            border: `1px solid ${isDark ? zinc[800] : zinc[200]}`,
            boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.6)' : '0 24px 48px rgba(0,0,0,0.12)',
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.0625rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            padding: '20px 24px 16px',
            color: isDark ? zinc[50] : zinc[900],
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
          },
          dividers: {
            borderColor: isDark ? zinc[800] : zinc[200],
            padding: '20px 24px',
          },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 24px 20px',
            gap: '8px',
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none' as const,
            fontWeight: 600,
            fontSize: '0.875rem',
          },
          outlined: {
            borderColor: isDark ? zinc[700] : zinc[300],
          },
        },
        variants: [
          {
            props: { variant: 'outlined', color: 'primary' },
            style: {
              '&:hover': {
                borderColor: primary.main,
                backgroundColor: alpha(primary.main, 0.06),
              },
            },
          },
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: isDark
                ? `linear-gradient(135deg, ${primary.main} 0%, ${primary.dark} 100%)`
                : primary.main,
              '&:hover': {
                background: isDark
                  ? `linear-gradient(135deg, ${primary.light} 0%, ${primary.main} 100%)`
                  : primary.dark,
                boxShadow: isDark ? `0 0 20px ${alpha(primary.main, 0.35)}` : 'none',
              },
            },
          },
        ],
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? zinc[700] : zinc[300],
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? zinc[500] : zinc[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primary.main,
              borderWidth: '1.5px',
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: '#EF4444',
            },
          },
          input: {
            padding: '10px 12px',
          },
        },
      },

      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            color: isDark ? zinc[400] : zinc[500],
            '&.Mui-focused': {
              color: primary.main,
            },
            '&.Mui-error': {
              color: '#EF4444',
            },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: '0.75rem',
            marginTop: 4,
            color: isDark ? zinc[500] : zinc[500],
            '&.Mui-error': {
              color: '#EF4444',
            },
          },
        },
      },

      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            color: isDark ? zinc[400] : zinc[500],
            '&.Mui-focused': {
              color: primary.main,
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          select: { padding: '10px 12px' },
        },
      },

      MuiAutocomplete: {
        styleOverrides: {
          inputRoot: {
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
          },
          input: { padding: '10px 4px !important' },
          paper: {
            borderRadius: 8,
            border: `1px solid ${isDark ? zinc[800] : zinc[200]}`,
            backgroundImage: 'none',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.10)',
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: alpha(primary.main, isDark ? 0.18 : 0.1),
              color: isDark ? primary.light : primary.dark,
              '& .MuiListItemIcon-root': {
                color: isDark ? primary.light : primary.dark,
              },
              '&:hover': {
                backgroundColor: alpha(primary.main, isDark ? 0.26 : 0.16),
              },
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            },
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            margin: '1px 4px',
            '&.Mui-selected': {
              backgroundColor: alpha(primary.main, isDark ? 0.2 : 0.1),
              '&:hover': {
                backgroundColor: alpha(primary.main, isDark ? 0.28 : 0.16),
              },
            },
          },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? zinc[900] : zinc[50],
              color: isDark ? zinc[400] : zinc[500],
              fontWeight: 600,
              fontSize: '0.7rem',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
              borderBottom: `1px solid ${isDark ? zinc[800] : zinc[200]}`,
              whiteSpace: 'nowrap',
            },
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: alpha(primary.main, isDark ? 0.05 : 0.03),
            },
            '&:last-child td, &:last-child th': { border: 0 },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? zinc[800] : zinc[200],
            padding: '10px 16px',
          },
        },
      },

      MuiTablePagination: {
        styleOverrides: {
          root: {
            color: isDark ? zinc[400] : zinc[500],
            borderTop: `1px solid ${isDark ? zinc[800] : zinc[200]}`,
          },
          select: {
            borderRadius: 4,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            fontSize: '0.75rem',
          },
          outlined: {
            borderColor: isDark ? zinc[700] : zinc[300],
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: primary.main,
            height: 2,
            borderRadius: 2,
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none' as const,
            fontWeight: 500,
            fontSize: '0.875rem',
            color: isDark ? zinc[400] : zinc[500],
            minHeight: 44,
            '&.Mui-selected': {
              color: isDark ? primary.light : primary.main,
              fontWeight: 600,
            },
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? zinc[700] : zinc[800],
            borderRadius: 6,
            fontSize: '0.75rem',
            padding: '6px 10px',
          },
          arrow: {
            color: isDark ? zinc[700] : zinc[800],
          },
        },
      },

      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? zinc[800] : zinc[200],
            borderRadius: 6,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? zinc[800] : zinc[200],
          },
        },
      },

      MuiBadge: {
        styleOverrides: {
          badge: { fontWeight: 600, fontSize: '0.65rem' },
        },
      },
    },
  });
};

export { buildTheme, THEME_PRESETS, type ThemeColor, type ThemeMode };
