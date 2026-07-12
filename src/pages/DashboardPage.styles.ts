import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  // DashboardPage – welcome header
  pageRoot: {} as Sx,
  welcomeHeader: { display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 } as Sx,
  welcomeTitle: { fontWeight: 600 } as Sx,

  // StatCard
  statCardPaper: {
    p: 2.5,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flex: '1 1 200px',
    maxWidth: 300,
  } as Sx,
  statCardIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 2,
    color: 'primary.contrastText',
    flexShrink: 0,
  } as Sx,
  statCardValue: { fontWeight: 600, lineHeight: 1.2 } as Sx,

  // SystemAdminDashboard – stats grid
  systemAdminStatsGrid: { display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 } as Sx,

  // SystemAdminDashboard – charts row
  systemAdminChartsRow: { display: 'flex', flexWrap: 'wrap', gap: 3, mt: 4 } as Sx,

  // SystemAdminDashboard – plan chart paper
  planChartPaper: { p: 2.5, flex: '1 1 300px', maxWidth: 380 } as Sx,
  planChartTitle: { fontWeight: 600, mb: 2 } as Sx,
  planChartSkeletonCircle: { mx: 'auto' } as Sx,

  // TenantAdminDashboard – stats grid
  tenantAdminStatsGrid: { display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 } as Sx,

  // TenantAdminDashboard – invitation chart section
  tenantAdminChartSection: { mt: 4 } as Sx,
  invitationChartPaper: { p: 2.5, maxWidth: 500 } as Sx,
  invitationChartTitle: { fontWeight: 600, mb: 2 } as Sx,

  // TenantUserDashboard – profile card
  tenantUserProfilePaper: { mt: 3, p: 3, maxWidth: 480 } as Sx,
  tenantUserProfileTitle: { fontWeight: 600, mb: 2 } as Sx,
  tenantUserDivider: { mb: 2 } as Sx,
  tenantUserProfileFields: { display: 'flex', flexDirection: 'column', gap: 1.5 } as Sx,
  tenantUserProfileRow: { display: 'flex', alignItems: 'center', gap: 1.5 } as Sx,
  tenantUserRolesRow: { display: 'flex', alignItems: 'flex-start', gap: 1.5 } as Sx,
  tenantUserRoleIcon: { mt: 0.25 } as Sx,
  tenantUserRolesChips: { display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 } as Sx,
} as const;
