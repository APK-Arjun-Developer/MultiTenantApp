import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ActivityIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DownloadIcon from '@mui/icons-material/Download';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory2';
import BusinessIcon from '@mui/icons-material/Business';
import ShieldIcon from '@mui/icons-material/Shield';
import { PageTransition } from '@/shared/components/PageTransition';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  useGetReportSummaryQuery,
  useGetPlatformSummaryQuery,
} from '@/features/reports/api/reportsApi';

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  loading: boolean;
}

function StatCard({ label, value, icon, loading }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
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
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={64} height={36} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {value?.toLocaleString() ?? '—'}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Tenant-scoped summary ────────────────────────────────────────────────────

function TenantSummary() {
  const { data, isLoading, isError } = useGetReportSummaryQuery();
  const canViewUsers = usePermission('Users.View');
  const canViewRoles = usePermission('Roles.View');

  const allStats: (StatCardProps & { show: boolean })[] = [
    {
      label: 'Users',
      value: data?.userCount,
      icon: <GroupIcon />,
      loading: isLoading,
      show: canViewUsers,
    },
    {
      label: 'Roles',
      value: data?.roleCount,
      icon: <ShieldIcon />,
      loading: isLoading,
      show: canViewRoles,
    },
    {
      label: 'Products',
      value: data?.productCount,
      icon: <InventoryIcon />,
      loading: isLoading,
      show: true,
    },
    {
      label: 'Activity Logs',
      value: data?.activityLogCount,
      icon: <ActivityIcon />,
      loading: isLoading,
      show: canViewUsers,
    },
  ];

  const stats = allStats.filter((s) => s.show);

  if (isError) {
    return (
      <Typography color="text.secondary" variant="body2">
        Could not load report data.
      </Typography>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>
      {data && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
          Last updated: {new Date(data.generatedAtUtc).toLocaleString()}
        </Typography>
      )}
    </>
  );
}

// ─── Platform-wide summary (SystemAdmin) ──────────────────────────────────────

function PlatformSummary() {
  const { data, isLoading, isError } = useGetPlatformSummaryQuery();

  const stats: StatCardProps[] = [
    { label: 'Tenants', value: data?.tenantCount, icon: <BusinessIcon />, loading: isLoading },
    { label: 'Total Users', value: data?.totalUserCount, icon: <GroupIcon />, loading: isLoading },
    {
      label: 'Total Products',
      value: data?.totalProductCount,
      icon: <InventoryIcon />,
      loading: isLoading,
    },
    {
      label: 'Activity Logs',
      value: data?.totalActivityLogCount,
      icon: <ActivityIcon />,
      loading: isLoading,
    },
  ];

  if (isError) {
    return (
      <Typography color="text.secondary" variant="body2">
        Could not load platform data.
      </Typography>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>
      {data && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
          Last updated: {new Date(data.generatedAtUtc).toLocaleString()}
        </Typography>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const isSystemAdmin = user?.systemRole === 'SystemAdmin';
  const canViewReports = usePermission('Reports.View');
  const canExport = usePermission('Reports.Export');

  return (
    <PageTransition>
      {/* Header */}
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}
      >
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
        </Box>

        {canExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/reports/${isSystemAdmin ? 'platform-export' : 'export'}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Export CSV
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Stats */}
      {isSystemAdmin ? (
        <PlatformSummary />
      ) : canViewReports ? (
        <TenantSummary />
      ) : (
        <Typography variant="body2" color="text.secondary">
          You don&apos;t have permission to view report data.
        </Typography>
      )}
    </PageTransition>
  );
}
