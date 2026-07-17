import { memo } from 'react';
import Chip from '@mui/material/Chip';

import type { InvitationStatusChipProps } from './types';

const InvitationStatusChip = memo(({ status }: InvitationStatusChipProps) => {
  const lower = status.toLowerCase();
  const color =
    lower === 'accepted'
      ? 'success'
      : lower === 'pending'
        ? 'primary'
        : lower === 'expired'
          ? 'warning'
          : 'error';
  const label = lower.charAt(0).toUpperCase() + lower.slice(1);
  return <Chip label={label} color={color} size="small" variant="filled" />;
});

export default InvitationStatusChip;
