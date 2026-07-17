import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { styles } from './NotFoundPage.styles';

const NotFoundPage = React.memo(() => {
  return (
    <Box sx={styles.root}>
      <Typography variant="h1" sx={styles.heading}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={styles.subtitle}>
        Page not found
      </Typography>
      <Button component={Link} to="/dashboard" variant="contained" sx={styles.goButton}>
        Go to Dashboard
      </Button>
    </Box>
  );
});
export default NotFoundPage;
