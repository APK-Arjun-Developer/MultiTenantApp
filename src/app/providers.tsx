import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppSelector } from './hooks';
import { buildTheme } from '@/shared/theme';
import { selectThemeMode } from '@/features/ui/uiSlice';

function ThemedApp({ children }: { children: ReactNode }) {
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <Toaster position="top-right" />
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
