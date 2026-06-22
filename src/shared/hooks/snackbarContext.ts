import { createContext } from 'react';

export type Severity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarContextValue {
  show: (message: string, severity?: Severity, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export const DEFAULT_SNACKBAR_DURATION: Record<Severity, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 4000,
};
