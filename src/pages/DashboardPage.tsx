import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmailIcon from '@mui/icons-material/Email';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import { PageTransition } from '@/shared/components/PageTransition';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { useGetDashboardStatsQuery } from '@/features/dashboard/api/dashboardApi';

interface StatCardProps {
  label: string;
  value: number | null | undefined;
  icon: React.ReactNode;
  color?: string;
  isLoading: boolean;
}

function StatCard({ label, value, icon, color = 'primary.main', isLoading }: StatCardProps) {
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
          bgcolor: color,
          color: 'primary.contrastText',
          flexShrink: 0,
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

function SystemAdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
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
      <StatCard
        label="Tenant Users"
        value={stats?.totalTenantUsers}
        icon={<PeopleIcon />}
        isLoading={isLoading}
      />
    </Box>
  );
}

function TenantAdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
      <StatCard
        label="Users"
        value={stats?.totalTenantUsers}
        icon={<PeopleIcon />}
        isLoading={isLoading}
      />
      <StatCard
        label="Roles"
        value={stats?.totalRoles}
        icon={<SecurityIcon />}
        color="secondary.main"
        isLoading={isLoading}
      />
      <StatCard
        label="Pending Invitations"
        value={stats?.totalPendingInvitations}
        icon={<HourglassEmptyIcon />}
        color="warning.main"
        isLoading={isLoading}
      />
    </Box>
  );
}

function TenantUserDashboard() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <Paper variant="outlined" sx={{ mt: 3, p: 3, maxWidth: 480 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Your profile
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIndIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Full name
            </Typography>
            <Typography variant="body2">{user?.fullName ?? '—'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EmailIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body2">{user?.email ?? '—'}</Typography>
          </Box>
        </Box>
        {user?.roles && user.roles.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <SecurityIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Roles
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {user.roles.map((r) => (
                  <Chip key={r} label={r} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  const isSystemAdmin = user?.systemRole === 'SystemAdmin';
  const isTenantAdmin = user?.systemRole === 'TenantAdmin';

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

      {isSystemAdmin && <SystemAdminDashboard />}
      {isTenantAdmin && <TenantAdminDashboard />}
      {!isSystemAdmin && !isTenantAdmin && <TenantUserDashboard />}
    </PageTransition>
  );
}
