import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmailIcon from '@mui/icons-material/Email';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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
        flex: '1 1 200px',
        maxWidth: 300,
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
  const theme = useTheme();
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  const planData = [
    { name: 'Free', value: stats?.freePlanTenants ?? 0 },
    { name: 'Pro', value: stats?.proPlanTenants ?? 0 },
  ];

  const PLAN_COLORS = [theme.palette.text.disabled, theme.palette.primary.main];

  return (
    <Box>
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 2.5, flex: '1 1 300px', maxWidth: 380 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Plan Distribution
          </Typography>
          {isLoading ? (
            <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {planData.map((_, index) => (
                    <Cell key={index} fill={PLAN_COLORS[index]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

function TenantAdminDashboard() {
  const theme = useTheme();
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  const invitationData = [
    {
      name: 'Pending',
      value: stats?.totalPendingInvitations ?? 0,
      color: theme.palette.warning.main,
    },
    { name: 'Accepted', value: stats?.acceptedInvitations ?? 0, color: theme.palette.success.main },
    { name: 'Expired', value: stats?.expiredInvitations ?? 0, color: theme.palette.text.disabled },
    { name: 'Revoked', value: stats?.revokedInvitations ?? 0, color: theme.palette.error.main },
  ];

  return (
    <Box>
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

      <Box sx={{ mt: 4 }}>
        <Paper variant="outlined" sx={{ p: 2.5, maxWidth: 500 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Invitation Overview
          </Typography>
          {isLoading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={invitationData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                  {invitationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>
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
    <Box>
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
    </Box>
  );
}
