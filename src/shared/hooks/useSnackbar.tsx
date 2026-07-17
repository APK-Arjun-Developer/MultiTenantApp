import { useContext } from 'react';
import { SnackbarContext, type SnackbarContextValue } from './snackbarContext';

const useSnackbar = (): SnackbarContextValue => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
};

export { useSnackbar };
