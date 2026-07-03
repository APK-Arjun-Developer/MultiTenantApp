import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleIcon from '@mui/icons-material/People';
import { PageTransition } from '@/shared/components/PageTransition';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { useGetDashboardStatsQuery } from '@/features/dashboard/api/dashboardApi';

interface StatCardProps {
  label: string;
  value: number | null | undefined;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatCard({ label, value, icon, isLoading }: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: '1 1 220px',
        maxWidth: 320,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {isLoading ? <Skeleton width={48} /> : (value ?? 0)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  const isSystemAdmin = user?.systemRole === 'SystemAdmin';
  const isTenantAdmin = user?.systemRole === 'TenantAdmin';

  // Stats endpoint is TenantAdmin-or-above; skip entirely for TenantUser.
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined, {
    skip: !isSystemAdmin && !isTenantAdmin,
  });

  return (
    <PageTransition>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <DashboardIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Welcome back{user?.fullName ? `, ${user.fullName}` : ''}.
      </Typography>

      {(isSystemAdmin || isTenantAdmin) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
          {isSystemAdmin && (
            <>
              <StatCard
                label="Tenants"
                value={stats?.totalTenants}
                icon={<BusinessIcon />}
                isLoading={isLoading}
              />
              <StatCard
                label="Tenant Admins"
                value={stats?.totalTenantAdmins}
                icon={<ManageAccountsIcon />}
                isLoading={isLoading}
              />
            </>
          )}
          <StatCard
            label={isSystemAdmin ? 'Tenant Users' : 'Users'}
            value={stats?.totalTenantUsers}
            icon={<PeopleIcon />}
            isLoading={isLoading}
          />
        </Box>
      )}
    </PageTransition>
  );
}
