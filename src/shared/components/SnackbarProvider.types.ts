import type { Severity } from '@/shared/hooks/snackbarContext';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
  duration: number;
  key: number;
}

export { type SnackbarState };
