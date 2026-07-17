import React, { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import type { CreatedViaChipProps } from './CreatedViaChip.types';
import Icon from './Icon';

/** Shows how a user account was created: directly by an admin or via an invitation link. */
const CreatedViaChip = React.memo(({ createdVia }: CreatedViaChipProps) => {
  const isInvitation = useMemo(() => createdVia === 'Invitation', [createdVia]);

  return (
    <Chip
      label={isInvitation ? 'Invitation' : 'Direct'}
      size="small"
      variant="outlined"
      color={isInvitation ? 'info' : 'default'}
      icon={
        isInvitation ? (
          <Icon name="Email" fontSize="small" />
        ) : (
          <Icon name="PersonAdd" fontSize="small" />
        )
      }
    />
  );
});
export default CreatedViaChip;
