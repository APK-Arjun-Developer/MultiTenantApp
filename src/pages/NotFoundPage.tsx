import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { styles } from './NotFoundPage.styles';

export const NotFoundPage = React.memo(function NotFoundPage() {
  return (
    <Box sx={styles.root}>
      <Typography variant="h1" sx={styles.heading}>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary">
        Page not found
      </Typography>
      <Button component={Link} to="/dashboard" variant="contained" sx={styles.goButton}>
        Go to Dashboard
      </Button>
    </Box>
  );
});
