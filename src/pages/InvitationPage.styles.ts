import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  // InvitationInvalid
  invalidStack: { alignItems: 'center', textAlign: 'center' } as Sx,
  invalidIconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
    border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as Sx,
  invalidIcon: { fontSize: '2rem', color: 'error.main' } as Sx,
  invalidTitle: { fontWeight: 700 } as Sx,
  invalidButton: { mt: 1 } as Sx,

  // InvitationSuccess
  successStack: { alignItems: 'center', textAlign: 'center' } as Sx,
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 3,
    background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)',
    border: '1px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as Sx,
  successIcon: { fontSize: '2rem', color: 'success.main' } as Sx,
  successTitle: { fontWeight: 700 } as Sx,
  successNameSpan: { fontWeight: 600, color: 'text.primary' } as Sx,
  successRolesSpan: { fontWeight: 600, color: 'text.primary' } as Sx,
  successButton: { mt: 1 } as Sx,

  // Loading state
  loadingBox: { display: 'flex', justifyContent: 'center', py: 4 } as Sx,

  // New-tenant flow wrapper
  newTenantRoot: {} as Sx,
  newTenantHeader: { display: 'flex', alignItems: 'center', gap: 1, mb: 2 } as Sx,
  headerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 1.25,
    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 10px rgba(124,58,237,0.28)',
  } as Sx,
  newTenantTitle: { fontWeight: 700 } as Sx,
  newTenantSubtitle: { mb: 2 } as Sx,
  newTenantEmailField: { mb: 2 } as Sx,

  // Admin/user flow wrapper
  adminUserRoot: {} as Sx,
  adminUserHeader: { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 } as Sx,
  adminUserTitle: { fontWeight: 700 } as Sx,
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
