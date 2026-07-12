import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  // ── Page root ──────────────────────────────────────────────────────────────
  pageRoot: {
    pb: 4,
  } as Sx,

  // ── Welcome header ─────────────────────────────────────────────────────────
  welcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 0.75,
  } as Sx,

  welcomeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 2,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 16px rgba(124,58,237,0.35)',
  } as Sx,

  welcomeTitle: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  } as Sx,

  welcomeSubtitle: {
    mt: 0.25,
    mb: 3,
  } as Sx,

  // ── StatCard ───────────────────────────────────────────────────────────────
  statCardPaper: {
    p: 2.5,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flex: '1 1 200px',
    maxWidth: 300,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      borderColor: '#A78BFA',
      boxShadow: '0 0 0 1px rgba(124,58,237,0.2), 0 4px 16px rgba(124,58,237,0.08)',
    },
  } as Sx,

  statCardIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 2,
    flexShrink: 0,
    '& svg': { fontSize: '1.375rem' },
  } as Sx,

  statCardValue: {
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  } as Sx,

  // ── SystemAdminDashboard ───────────────────────────────────────────────────
  systemAdminStatsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    mt: 3,
  } as Sx,

  systemAdminChartsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    mt: 4,
  } as Sx,

  planChartPaper: {
    p: 2.5,
    flex: '1 1 300px',
    maxWidth: 400,
  } as Sx,

  planChartTitle: {
    fontWeight: 600,
    mb: 2,
  } as Sx,

  planChartSkeletonCircle: {
    mx: 'auto',
  } as Sx,

  // ── TenantAdminDashboard ───────────────────────────────────────────────────
  tenantAdminStatsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    mt: 3,
  } as Sx,

  tenantAdminChartSection: {
    mt: 4,
  } as Sx,

  invitationChartPaper: {
    p: 2.5,
    maxWidth: 540,
  } as Sx,

  invitationChartTitle: {
    fontWeight: 600,
    mb: 2,
  } as Sx,

  // ── TenantUserDashboard ────────────────────────────────────────────────────
  tenantUserProfilePaper: {
    mt: 3,
    p: 3,
    maxWidth: 480,
  } as Sx,

  tenantUserProfileTitle: {
    fontWeight: 600,
    mb: 2,
  } as Sx,

  tenantUserDivider: {
    mb: 2,
  } as Sx,

  tenantUserProfileFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
  } as Sx,

  tenantUserProfileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  } as Sx,

  tenantUserRolesRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.5,
  } as Sx,

  tenantUserRoleIcon: {
    mt: 0.25,
  } as Sx,

  tenantUserRolesChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    mt: 0.5,
  } as Sx,
} as const;
