import { createContext } from 'react';

type Severity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextValue {
  show: (message: string, severity?: Severity, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const DEFAULT_SNACKBAR_DURATION: Record<Severity, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 4000,
};

export { SnackbarContext, DEFAULT_SNACKBAR_DURATION, type Severity, type SnackbarContextValue };
