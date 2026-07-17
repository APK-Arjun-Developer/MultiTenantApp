import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { selectSelectedTenantId } from '@/features/ui/uiSlice';
import type { TenantContextGuardProps } from './TenantContextGuard.types';
import { styles } from './TenantContextGuard.styles';
import Icon from './Icon';

const TenantContextGuard = React.memo(({ children }: TenantContextGuardProps) => {
  const user = useAppSelector(selectCurrentUser);
  const selectedTenantId = useAppSelector(selectSelectedTenantId);

  if (user?.systemRole === 'SystemAdmin' && !selectedTenantId) {
    return (
      <Box sx={styles.emptyState}>
        <Box sx={styles.iconBox}>
          <Icon name="Business" sx={styles.icon} />
        </Box>
        <Typography variant="h6" sx={styles.heading}>
          No tenant selected
        </Typography>
        <Typography variant="body2" sx={styles.body}>
          Select a tenant from the top bar to view and manage its data.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
});
export default TenantContextGuard;
