import { alpha } from '@mui/material/styles';
import type { Sx } from '@/types/styles';

export const styles = {
  // ── Page root ──────────────────────────────────────────────────────────────
  pageRoot: {
    pb: 4,
  },

  // ── Welcome header ─────────────────────────────────────────────────────────
  welcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 0.75,
  },

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
  },

  welcomeTitle: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },

  welcomeSubtitle: {
    mt: 0.25,
    mb: 3,
  },

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
  },

  statCardIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 2,
    flexShrink: 0,
    '& svg': { fontSize: '1.375rem' },
  },

  statCardValue: {
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },

  // ── SystemAdminDashboard ───────────────────────────────────────────────────
  systemAdminStatsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    mt: 3,
  },

  systemAdminChartsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    mt: 4,
  },

  planChartPaper: {
    p: 2.5,
    flex: '1 1 300px',
    maxWidth: 400,
  },

  planChartTitle: {
    fontWeight: 600,
    mb: 2,
  },

  planChartSkeletonCircle: {
    mx: 'auto',
  },

  // ── TenantAdminDashboard ───────────────────────────────────────────────────
  tenantAdminStatsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    mt: 3,
  },

  tenantAdminChartSection: {
    mt: 4,
  },

  invitationChartPaper: {
    p: 2.5,
    maxWidth: 540,
  },

  invitationChartTitle: {
    fontWeight: 600,
    mb: 2,
  },

  // ── TenantUserDashboard ────────────────────────────────────────────────────
  tenantUserProfilePaper: {
    mt: 3,
    p: 3,
    maxWidth: 480,
  },

  tenantUserProfileTitle: {
    fontWeight: 600,
    mb: 2,
  },

  tenantUserDivider: {
    mb: 2,
  },

  tenantUserProfileFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
  },

  tenantUserProfileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },

  tenantUserRolesRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.5,
  },

  tenantUserRoleIcon: {
    mt: 0.25,
  },

  tenantUserRolesChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    mt: 0.5,
  },
  skeletonRounded: {
    borderRadius: 1,
  },
} as const satisfies Record<string, Sx>;

export function statCardIconBoxColor(hex: string): Sx {
  return {
    background: `linear-gradient(135deg, ${alpha(hex, 0.15)} 0%, ${alpha(hex, 0.28)} 100%)`,
    boxShadow: `0 0 14px ${alpha(hex, 0.18)}`,
    color: hex,
    border: `1px solid ${alpha(hex, 0.2)}`,
  };
}
