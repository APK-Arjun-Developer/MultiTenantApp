import React, { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import type { CreatedViaChipProps } from './CreatedViaChip.types';

/** Shows how a user account was created: directly by an admin or via an invitation link. */
export const CreatedViaChip = React.memo(function CreatedViaChip({
  createdVia,
}: CreatedViaChipProps) {
  const isInvitation = useMemo(() => createdVia === 'Invitation', [createdVia]);

  return (
    <Chip
      label={isInvitation ? 'Invitation' : 'Direct'}
      size="small"
      variant="outlined"
      color={isInvitation ? 'info' : 'default'}
      icon={isInvitation ? <EmailIcon fontSize="small" /> : <PersonAddIcon fontSize="small" />}
    />
  );
});
