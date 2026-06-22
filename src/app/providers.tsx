import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { useAppSelector } from './hooks';
import { buildTheme } from '@/shared/theme';
import { selectThemeMode } from '@/features/ui/uiSlice';
import { SnackbarProvider } from '@/shared/components/SnackbarProvider';

function ThemedApp({ children }: { children: ReactNode }) {
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{children}</SnackbarProvider>
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemedApp>{children}</ThemedApp>
    </Provider>
  );
}
