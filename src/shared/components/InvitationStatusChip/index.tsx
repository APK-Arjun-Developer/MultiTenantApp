import { memo } from 'react';
import Chip, { type ChipProps } from '@mui/material/Chip';

import type { InvitationStatusChipProps } from './types';

const STATUS_COLORS: Record<string, ChipProps['color']> = {
  accepted: 'success',
  pending: 'primary',
  expired: 'warning',
};

const InvitationStatusChip = memo(({ status }: InvitationStatusChipProps) => {
  const lower = status.toLowerCase();
  const color = STATUS_COLORS[lower] ?? 'error';
  const label = lower.charAt(0).toUpperCase() + lower.slice(1);
  return <Chip label={label} color={color} size="small" variant="filled" />;
});

export default InvitationStatusChip;
