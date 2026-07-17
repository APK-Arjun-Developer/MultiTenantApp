import { alpha, createTheme } from '@mui/material/styles';

// ─── Raw design tokens ────────────────────────────────────────────────────────

const violet = {
  50: '#F5F3FF',
  100: '#EDE9FE',
  200: '#DDD6FE',
  300: '#C4B5FD',
  400: '#A78BFA',
  500: '#8B5CF6',
  600: '#7C3AED',
  700: '#6D28D9',
  800: '#5B21B6',
  900: '#2E1065',
} as const;

const cyan = {
  300: '#67E8F9',
  400: '#22D3EE',
  500: '#06B6D4',
  600: '#0891B2',
} as const;

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

// ─── Theme builder ────────────────────────────────────────────────────────────

const buildTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: violet[600], // #7C3AED
        light: violet[400], // #A78BFA
        dark: violet[800], // #5B21B6
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: cyan[500], // #06B6D4
        light: cyan[300], // #67E8F9
        dark: cyan[600], // #0891B2
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? zinc[950] : zinc[100], // #09090B / #F4F4F5
        paper: isDark ? zinc[900] : '#FFFFFF', // #18181B / #FFFFFF
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
        main: cyan[500],
        dark: cyan[600],
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
        selected: alpha(violet[600], isDark ? 0.18 : 0.1),
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
      // ── Global baseline ──────────────────────────────────────────────────────
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

      // ── Layout surfaces ──────────────────────────────────────────────────────
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

      // ── Cards & surfaces ─────────────────────────────────────────────────────
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

      // ── Buttons ──────────────────────────────────────────────────────────────
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
                borderColor: violet[600],
                backgroundColor: alpha(violet[600], 0.06),
              },
            },
          },
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: isDark
                ? `linear-gradient(135deg, ${violet[600]} 0%, ${violet[700]} 100%)`
                : violet[600],
              '&:hover': {
                background: isDark
                  ? `linear-gradient(135deg, ${violet[500]} 0%, ${violet[600]} 100%)`
                  : violet[700],
                boxShadow: isDark ? `0 0 20px ${alpha(violet[600], 0.35)}` : 'none',
              },
            },
          },
        ],
      },

      // ── Inputs ───────────────────────────────────────────────────────────────
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
              borderColor: violet[600],
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
              color: violet[600],
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
              color: violet[600],
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

      // ── Lists & nav ──────────────────────────────────────────────────────────
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: alpha(violet[600], isDark ? 0.18 : 0.1),
              color: isDark ? violet[400] : violet[700],
              '& .MuiListItemIcon-root': {
                color: isDark ? violet[400] : violet[700],
              },
              '&:hover': {
                backgroundColor: alpha(violet[600], isDark ? 0.26 : 0.16),
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
              backgroundColor: alpha(violet[600], isDark ? 0.2 : 0.1),
              '&:hover': {
                backgroundColor: alpha(violet[600], isDark ? 0.28 : 0.16),
              },
            },
          },
        },
      },

      // ── Tables ───────────────────────────────────────────────────────────────
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
              backgroundColor: alpha(violet[600], isDark ? 0.05 : 0.03),
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

      // ── Chips ────────────────────────────────────────────────────────────────
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

      // ── Tabs ─────────────────────────────────────────────────────────────────
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: violet[600],
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
              color: isDark ? violet[400] : violet[600],
              fontWeight: 600,
            },
          },
        },
      },

      // ── Feedback ─────────────────────────────────────────────────────────────
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

export { buildTheme };
