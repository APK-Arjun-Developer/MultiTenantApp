import React, { useCallback, useMemo } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styles } from './ErrorPage.styles';
import Icon from './Icon';

const ErrorPage = React.memo(() => {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      return typeof error.data === 'string' ? error.data : error.statusText;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  }, [error]);

  const handleBack = useCallback(() => {
    void navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.iconBox}>
        <Icon name="ErrorOutline" sx={styles.icon} />
      </Box>
      <Typography variant="h5" sx={styles.title}>
        Something went wrong
      </Typography>
      <Typography variant="body2" sx={styles.message}>
        {message}
      </Typography>
      <Button variant="contained" onClick={handleBack} sx={styles.button}>
        Back to Dashboard
      </Button>
    </Box>
  );
});
export default ErrorPage;
