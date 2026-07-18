import { memo } from 'react';
import Chip from '@mui/material/Chip';

import type { ActiveStatusChipProps } from './types';

const ActiveStatusChip = memo(({ isActive }: ActiveStatusChipProps) => (
  <Chip
    label={isActive ? 'Active' : 'Inactive'}
    size="small"
    color={isActive ? 'success' : 'default'}
    variant={isActive ? 'filled' : 'outlined'}
  />
));

export default ActiveStatusChip;
