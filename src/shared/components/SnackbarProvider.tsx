import { useCallback, useState, type ReactNode, type SyntheticEvent } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
  SnackbarContext,
  DEFAULT_SNACKBAR_DURATION,
  type Severity,
} from '@/shared/hooks/snackbarContext';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
  duration: number;
  key: number;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
    duration: 4000,
    key: 0,
  });

  const show = useCallback((message: string, severity: Severity = 'info', duration?: number) => {
    setState((prev) => ({
      open: true,
      message,
      severity,
      duration: duration ?? DEFAULT_SNACKBAR_DURATION[severity],
      key: prev.key + 1,
    }));
  }, []);

  const success = useCallback((msg: string, dur?: number) => show(msg, 'success', dur), [show]);
  const error = useCallback((msg: string, dur?: number) => show(msg, 'error', dur), [show]);
  const warning = useCallback((msg: string, dur?: number) => show(msg, 'warning', dur), [show]);
  const info = useCallback((msg: string, dur?: number) => show(msg, 'info', dur), [show]);

  const handleClose = (_: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <Snackbar
        key={state.key}
        open={state.open}
        autoHideDuration={state.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={state.severity}
          variant="filled"
          onClose={(e: SyntheticEvent) => handleClose(e)}
          sx={{ width: '100%', minWidth: 280 }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
