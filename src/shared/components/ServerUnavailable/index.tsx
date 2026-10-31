import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Icon from '../Icon';
import LoadingButton from '../LoadingButton';
import { styles } from './styles';
import type { ServerUnavailableProps } from './types';

const ServerUnavailable = React.memo(({ onRetry, retrying = false }: ServerUnavailableProps) => {
  return (
    <Stack spacing={2} sx={styles.root}>
      <Box sx={styles.iconBox}>
        <Icon name="ErrorOutline" sx={styles.icon} />
      </Box>
      <Typography variant="h6" sx={styles.title}>
        Server unavailable
      </Typography>
      <Typography variant="body2" color="text.secondary">
        We can’t reach the server right now. Your link is still valid — please try again shortly.
      </Typography>
      <LoadingButton
        variant="contained"
        fullWidth
        size="large"
        loading={retrying}
        onClick={onRetry}
        sx={styles.button}
      >
        Retry
      </LoadingButton>
    </Stack>
  );
});
export default ServerUnavailable;
