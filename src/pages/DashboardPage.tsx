import { memo, useCallback, useMemo } from 'react';
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
import { styles } from './DashboardPage.styles';
import type { StatCardProps } from './DashboardPage.types';

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  color = 'primary.main',
  isLoading,
}: StatCardProps) {
  return (
    <Paper variant="outlined" sx={styles.statCardPaper}>
      <Box sx={[styles.statCardIconBox, { bgcolor: color }] as never}>{icon}</Box>
      <Box>
        <Typography variant="h5" sx={styles.statCardValue}>
          {isLoading ? <Skeleton width={48} /> : (value ?? 0)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
});

// ─── SystemAdminDashboard ─────────────────────────────────────────────────────

const SystemAdminStatsGrid = memo(function SystemAdminStatsGrid({
  stats,
  isLoading,
}: {
  stats: ReturnType<typeof useGetDashboardStatsQuery>['data'];
  isLoading: boolean;
}) {
  return (
    <Box sx={styles.systemAdminStatsGrid}>
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
});

const SystemAdminDashboard = memo(function SystemAdminDashboard() {
  const theme = useTheme();
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  const planData = useMemo(
    () => [
      { name: 'Free', value: stats?.freePlanTenants ?? 0 },
      { name: 'Pro', value: stats?.proPlanTenants ?? 0 },
    ],
    [stats?.freePlanTenants, stats?.proPlanTenants],
  );

  const planColors = useMemo(
    () => [theme.palette.text.disabled, theme.palette.primary.main],
    [theme.palette.text.disabled, theme.palette.primary.main],
  );

  return (
    <Box>
      <SystemAdminStatsGrid stats={stats} isLoading={isLoading} />

      <Box sx={styles.systemAdminChartsRow}>
        <Paper variant="outlined" sx={styles.planChartPaper}>
          <Typography variant="subtitle2" sx={styles.planChartTitle}>
            Plan Distribution
          </Typography>
          {isLoading ? (
            <Skeleton
              variant="circular"
              width={180}
              height={180}
              sx={styles.planChartSkeletonCircle}
            />
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
                    <Cell key={index} fill={planColors[index]} />
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
});

// ─── TenantAdminDashboard ─────────────────────────────────────────────────────

const TenantAdminStatsGrid = memo(function TenantAdminStatsGrid({
  stats,
  isLoading,
}: {
  stats: ReturnType<typeof useGetDashboardStatsQuery>['data'];
  isLoading: boolean;
}) {
  return (
    <Box sx={styles.tenantAdminStatsGrid}>
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
});

const TenantAdminDashboard = memo(function TenantAdminDashboard() {
  const theme = useTheme();
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  const invitationData = useMemo(
    () => [
      {
        name: 'Pending',
        value: stats?.totalPendingInvitations ?? 0,
        color: theme.palette.warning.main,
      },
      {
        name: 'Accepted',
        value: stats?.acceptedInvitations ?? 0,
        color: theme.palette.success.main,
      },
      {
        name: 'Expired',
        value: stats?.expiredInvitations ?? 0,
        color: theme.palette.text.disabled,
      },
      {
        name: 'Revoked',
        value: stats?.revokedInvitations ?? 0,
        color: theme.palette.error.main,
      },
    ],
    [
      stats?.totalPendingInvitations,
      stats?.acceptedInvitations,
      stats?.expiredInvitations,
      stats?.revokedInvitations,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.text.disabled,
      theme.palette.error.main,
    ],
  );

  return (
    <Box>
      <TenantAdminStatsGrid stats={stats} isLoading={isLoading} />

      <Box sx={styles.tenantAdminChartSection}>
        <Paper variant="outlined" sx={styles.invitationChartPaper}>
          <Typography variant="subtitle2" sx={styles.invitationChartTitle}>
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
});

// ─── TenantUserDashboard ──────────────────────────────────────────────────────

const TenantUserDashboard = memo(function TenantUserDashboard() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <Paper variant="outlined" sx={styles.tenantUserProfilePaper}>
      <Typography variant="subtitle1" sx={styles.tenantUserProfileTitle}>
        Your profile
      </Typography>
      <Divider sx={styles.tenantUserDivider} />
      <Box sx={styles.tenantUserProfileFields}>
        <Box sx={styles.tenantUserProfileRow}>
          <AssignmentIndIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Full name
            </Typography>
            <Typography variant="body2">{user?.fullName ?? '—'}</Typography>
          </Box>
        </Box>
        <Box sx={styles.tenantUserProfileRow}>
          <EmailIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body2">{user?.email ?? '—'}</Typography>
          </Box>
        </Box>
        {user?.roles && user.roles.length > 0 && (
          <Box sx={styles.tenantUserRolesRow}>
            <SecurityIcon fontSize="small" color="action" sx={styles.tenantUserRoleIcon} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Roles
              </Typography>
              <Box sx={styles.tenantUserRolesChips}>
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
});

// ─── DashboardPage ────────────────────────────────────────────────────────────

const WelcomeHeader = memo(function WelcomeHeader({ fullName }: { fullName?: string | null }) {
  return (
    <>
      <Box sx={styles.welcomeHeader}>
        <DashboardIcon color="primary" />
        <Typography variant="h5" sx={styles.welcomeTitle}>
          Dashboard
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Welcome back{fullName ? `, ${fullName}` : ''}.
      </Typography>
    </>
  );
});

export const DashboardPage = memo(function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  const isSystemAdmin = useMemo(() => user?.systemRole === 'SystemAdmin', [user?.systemRole]);
  const isTenantAdmin = useMemo(() => user?.systemRole === 'TenantAdmin', [user?.systemRole]);

  const renderDashboardSection = useCallback(() => {
    if (isSystemAdmin) return <SystemAdminDashboard />;
    if (isTenantAdmin) return <TenantAdminDashboard />;
    return <TenantUserDashboard />;
  }, [isSystemAdmin, isTenantAdmin]);

  return (
    <Box sx={styles.pageRoot}>
      <WelcomeHeader fullName={user?.fullName} />
      {renderDashboardSection()}
    </Box>
  );
});
