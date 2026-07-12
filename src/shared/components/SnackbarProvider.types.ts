import type { Severity } from '@/shared/hooks/snackbarContext';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
  duration: number;
  key: number;
}
