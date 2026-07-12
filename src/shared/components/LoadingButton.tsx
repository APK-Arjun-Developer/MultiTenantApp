import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type { LoadingButtonProps } from './LoadingButton.types';
import { styles } from './LoadingButton.styles';

export const LoadingButton = React.memo(function LoadingButton({
  loading = false,
  children,
  disabled,
  sx,
  ...rest
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} sx={{ position: 'relative', ...sx }} {...rest}>
      <Box component="span" sx={loading ? styles.spinnerHidden : styles.spinnerVisible}>
        {children}
      </Box>
      {loading && <CircularProgress size={16} color="inherit" sx={styles.spinner} />}
    </Button>
  );
});
