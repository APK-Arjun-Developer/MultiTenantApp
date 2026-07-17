import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { styles } from './styles';
import type { LabelValueProps } from './types';

const LabelValue = React.memo(({ label, value, emptyText = '—', sx }: LabelValueProps) => {
  const isEmpty = useMemo(() => value === undefined || value === null || value === '', [value]);

  return (
    <Box sx={sx}>
      <Typography variant="caption" color="text.secondary" sx={styles.label}>
        {label}
      </Typography>
      <Typography variant="body2" color={isEmpty ? 'text.disabled' : 'text.primary'}>
        {isEmpty ? emptyText : value}
      </Typography>
    </Box>
  );
});
export default LabelValue;
