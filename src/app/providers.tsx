import { type ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { selectThemeMode } from '@/features/ui/uiSlice';
import { SnackbarProvider } from '@/shared/components';
import { buildTheme } from '@/shared/theme';

import { useAppSelector } from './hooks';
import { store } from './store';

const ThemedApp = ({ children }: { children: ReactNode }) => {
  const themeMode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{children}</SnackbarProvider>
    </ThemeProvider>
  );
};

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <ThemedApp>{children}</ThemedApp>
    </Provider>
  );
};
export default AppProviders;
