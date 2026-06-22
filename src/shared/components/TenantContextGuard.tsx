import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BusinessIcon from '@mui/icons-material/Business';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { selectSelectedTenantId } from '@/features/ui/uiSlice';

interface Props {
  children: ReactNode;
}

export function TenantContextGuard({ children }: Props) {
  const user = useAppSelector(selectCurrentUser);
  const selectedTenantId = useAppSelector(selectSelectedTenantId);

  if (user?.systemRole === 'SystemAdmin' && !selectedTenantId) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          gap: 2,
          color: 'text.secondary',
        }}
      >
        <BusinessIcon sx={{ fontSize: 56, opacity: 0.3 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          No tenant selected
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: 340 }}>
          Select a tenant from the top bar to view and manage its data.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
