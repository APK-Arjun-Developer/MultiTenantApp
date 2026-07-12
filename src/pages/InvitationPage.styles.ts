import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  // InvitationInvalid
  invalidStack: { alignItems: 'center', textAlign: 'center' } as Sx,
  invalidIcon: { fontSize: 48, color: 'error.main' } as Sx,
  invalidTitle: { fontWeight: 600 } as Sx,
  invalidButton: { mt: 1 } as Sx,

  // InvitationSuccess
  successStack: { alignItems: 'center', textAlign: 'center' } as Sx,
  successIcon: { fontSize: 48, color: 'success.main' } as Sx,
  successTitle: { fontWeight: 600 } as Sx,
  successNameSpan: { fontWeight: 600, color: 'text.primary' } as Sx,
  successRolesSpan: { fontWeight: 600, color: 'text.primary' } as Sx,
  successButton: { mt: 1 } as Sx,

  // Loading state
  loadingBox: { display: 'flex', justifyContent: 'center', py: 4 } as Sx,

  // New-tenant flow wrapper
  newTenantRoot: {} as Sx,
  newTenantHeader: { display: 'flex', alignItems: 'center', gap: 1, mb: 2 } as Sx,
  newTenantTitle: { fontWeight: 600 } as Sx,
  newTenantSubtitle: { mb: 2 } as Sx,
  newTenantEmailField: { mb: 2 } as Sx,

  // Admin/user flow wrapper
  adminUserRoot: {} as Sx,
  adminUserHeader: { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 } as Sx,
  adminUserTitle: { fontWeight: 600 } as Sx,
  adminUserSubtitle: { mb: 1 } as Sx,
  adminUserTenantRow: { display: 'flex', alignItems: 'center', gap: 1, mb: 2 } as Sx,
  adminUserTenantName: { fontWeight: 700 } as Sx,
  adminUserEmailField: { mb: 2 } as Sx,

  // Wizard renderActions
  wizardActions: { display: 'flex', gap: 1, mt: 1 } as Sx,
  wizardActionButton: { flex: 1 } as Sx,

  // FormWizard container override
  formWizardContainer: { boxShadow: 'none', p: 0, bgcolor: 'transparent' } as Sx,
} as const;
