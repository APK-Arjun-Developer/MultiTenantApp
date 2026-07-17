import { memo, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTheme, alpha, type SxProps, type Theme } from '@mui/material/styles';
import {
  PieChart,
  Pie,
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
import { styles, statCardIconBoxColor } from './DashboardPage.styles';
import type { StatCardProps, StatCardColor } from './DashboardPage.types';
import type { DashboardStatsDto } from '@/types/api';
import { Icon } from '@/shared/components';

// ─── StatCard ─────────────────────────────────────────────────────────────────

const resolveHex = (theme: Theme, color: StatCardColor): string => {
  const map: Record<StatCardColor, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    success: theme.palette.success.main,
    info: theme.palette.info.main,
  };
  return map[color];
};

const StatCard = memo(({ label, value, icon, color, isLoading }: StatCardProps) => {
  const theme = useTheme();
  const hex = resolveHex(theme, color ?? 'primary');

  return (
    <Paper variant="outlined" sx={styles.statCardPaper}>
      <Box sx={[styles.statCardIconBox, statCardIconBoxColor(hex)] as SxProps<Theme>}>{icon}</Box>
      <Box>
        <Typography variant="h4" sx={styles.statCardValue}>
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

const SystemAdminStatsGrid = memo(
  ({ stats, isLoading }: { stats: DashboardStatsDto | undefined; isLoading: boolean }) => {
    return (
      <Box sx={styles.systemAdminStatsGrid}>
        <StatCard
          label="Tenants"
          value={stats?.totalTenants}
          icon={<Icon name="Business" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Tenant Admins"
          value={stats?.totalTenantAdmins}
          icon={<Icon name="ManageAccounts" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Tenant Users"
          value={stats?.totalTenantUsers}
          icon={<Icon name="People" />}
          isLoading={isLoading}
        />
      </Box>
    );
  },
);

const SystemAdminDashboard = memo(() => {
  const theme = useTheme();
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  const planData = useMemo(
    () => [
      { name: 'Free', value: stats?.freePlanTenants ?? 0, fill: theme.palette.text.disabled },
      { name: 'Pro', value: stats?.proPlanTenants ?? 0, fill: theme.palette.primary.main },
    ],
    [
      stats?.freePlanTenants,
      stats?.proPlanTenants,
      theme.palette.text.disabled,
      theme.palette.primary.main,
    ],
  );

  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 8,
      fontSize: 12,
      color: theme.palette.text.primary,
    }),
    [theme.palette.background.paper, theme.palette.divider, theme.palette.text.primary],
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
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: theme.palette.text.secondary }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
});

// ─── TenantAdminDashboard ─────────────────────────────────────────────────────

const TenantAdminStatsGrid = memo(
  ({ stats, isLoading }: { stats: DashboardStatsDto | undefined; isLoading: boolean }) => {
    return (
      <Box sx={styles.tenantAdminStatsGrid}>
        <StatCard
          label="Users"
          value={stats?.totalTenantUsers}
          icon={<Icon name="People" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Roles"
          value={stats?.totalRoles}
          icon={<Icon name="Security" />}
          color="secondary"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending Invitations"
          value={stats?.totalPendingInvitations}
          icon={<Icon name="HourglassEmpty" />}
          color="warning"
          isLoading={isLoading}
        />
      </Box>
    );
  },
);

const TenantAdminDashboard = memo(() => {
  const theme = useTheme();
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined);

  const invitationData = useMemo(
    () => [
      {
        name: 'Pending',
        value: stats?.totalPendingInvitations ?? 0,
        fill: theme.palette.warning.main,
      },
      {
        name: 'Accepted',
        value: stats?.acceptedInvitations ?? 0,
        fill: theme.palette.success.main,
      },
      {
        name: 'Expired',
        value: stats?.expiredInvitations ?? 0,
        fill: theme.palette.text.disabled,
      },
      {
        name: 'Revoked',
        value: stats?.revokedInvitations ?? 0,
        fill: theme.palette.error.main,
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

  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 8,
      fontSize: 12,
      color: theme.palette.text.primary,
    }),
    [theme.palette.background.paper, theme.palette.divider, theme.palette.text.primary],
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
            <Skeleton variant="rectangular" height={200} sx={styles.skeletonRounded} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={invitationData} barSize={36}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  axisLine={{ stroke: theme.palette.divider }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
});

// ─── TenantUserDashboard ──────────────────────────────────────────────────────

const TenantUserDashboard = memo(() => {
  const user = useAppSelector(selectCurrentUser);

  return (
    <Paper variant="outlined" sx={styles.tenantUserProfilePaper}>
      <Typography variant="subtitle1" sx={styles.tenantUserProfileTitle}>
        Your profile
      </Typography>
      <Divider sx={styles.tenantUserDivider} />
      <Box sx={styles.tenantUserProfileFields}>
        <Box sx={styles.tenantUserProfileRow}>
          <Icon name="AssignmentInd" fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Full name
            </Typography>
            <Typography variant="body2">{user?.fullName ?? '—'}</Typography>
          </Box>
        </Box>
        <Box sx={styles.tenantUserProfileRow}>
          <Icon name="Email" fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body2">{user?.email ?? '—'}</Typography>
          </Box>
        </Box>
        {user?.roles && user.roles.length > 0 && (
          <Box sx={styles.tenantUserRolesRow}>
            <Icon name="Security" fontSize="small" color="action" sx={styles.tenantUserRoleIcon} />
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

const WelcomeHeader = memo(({ fullName }: { fullName?: string | null }) => {
  return (
    <>
      <Box sx={styles.welcomeHeader}>
        <Box sx={styles.welcomeIconBox}>
          <Icon name="Dashboard" fontSize="small" />
        </Box>
        <Typography variant="h5" sx={styles.welcomeTitle}>
          Dashboard
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={styles.welcomeSubtitle}>
        Welcome back{fullName ? `, ${fullName}` : ''}.
      </Typography>
    </>
  );
});

const DashboardPage = memo(() => {
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
export default DashboardPage;
