import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { buttonRootStyle, styles } from './styles';
import type { LoadingButtonProps } from './types';

const LoadingButton = React.memo(
  ({ loading = false, children, disabled, sx, ...rest }: LoadingButtonProps) => {
    return (
      <Button
        disabled={loading || disabled}
        aria-busy={loading}
        style={buttonRootStyle}
        sx={sx}
        {...rest}
      >
        <Box component="span" sx={loading ? styles.spinnerHidden : styles.spinnerVisible}>
          {children}
        </Box>
        {loading && <CircularProgress size={16} color="inherit" aria-hidden sx={styles.spinner} />}
      </Button>
    );
  },
);
export default LoadingButton;
