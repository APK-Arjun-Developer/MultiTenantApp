import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { AvatarUpload } from '@/shared/components/AvatarUpload';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { LabelValue } from '@/shared/components/LabelValue';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import {
  addressZodShape,
  getAddressFields,
  buildAddressPayload,
  tenantAddressZodShape,
  getTenantAddressFields,
  buildTenantAddressPayload,
} from '@/shared/forms/addressFields';
import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
  useUploadCurrentUserAvatarMutation,
  useRemoveCurrentUserAvatarMutation,
  getUserAvatarUrl,
} from '@/features/users/api/usersApi';
import {
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
  useUploadTenantLogoMutation,
  useRemoveTenantLogoMutation,
  getTenantLogoUrl,
} from '@/features/tenantSettings/api/tenantSettingsApi';
import type { ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
});
type ProfileValues = z.infer<typeof profileSchema>;

const addressSchema = z.object(addressZodShape);
type AddressValues = z.infer<typeof addressSchema>;

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  ...tenantAddressZodShape,
});
type CompanyValues = z.infer<typeof companySchema>;

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data: profile, isLoading } = useGetCurrentUserQuery();
  const [updateCurrentUser] = useUpdateCurrentUserMutation();
  const [changePassword] = useChangePasswordMutation();
  const [uploadAvatar, { isLoading: avatarUploading }] = useUploadCurrentUserAvatarMutation();
  const [removeAvatar, { isLoading: avatarRemoving }] = useRemoveCurrentUserAvatarMutation();

  const isTenantAdmin = profile?.systemRole === 'TenantAdmin';
  const { data: tenantSettings } = useGetTenantSettingsQuery(undefined, { skip: !isTenantAdmin });
  const [updateTenantSettings] = useUpdateTenantSettingsMutation();
  const [uploadTenantLogo, { isLoading: logoUploading }] = useUploadTenantLogoMutation();
  const [removeTenantLogo, { isLoading: logoRemoving }] = useRemoveTenantLogoMutation();

  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const profileFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: profile?.fullName ?? '',
      },
    ],
    [profile],
  );

  const passwordFields: FieldConfig[] = [
    {
      name: 'currentPassword',
      label: 'Current password',
      type: FIELD_TYPE.PASSWORD,
      required: true,
      muiProps: { autoComplete: 'current-password' },
    },
    {
      name: 'newPassword',
      label: 'New password',
      type: FIELD_TYPE.PASSWORD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm new password',
      type: FIELD_TYPE.PASSWORD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
  ];

  const addressFields = useMemo<FieldConfig[]>(() => getAddressFields(profile?.address), [profile]);

  const companyFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Company name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: tenantSettings?.name ?? '',
      },
      ...getTenantAddressFields(tenantSettings?.address),
    ],
    [tenantSettings],
  );

  const onProfileSubmit = async (values: ProfileValues) => {
    try {
      await updateCurrentUser({ fullName: values.fullName }).unwrap();
      snackbar.success('Profile updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update profile.');
    }
  };

  const onAddressSubmit = async (values: AddressValues) => {
    try {
      await updateCurrentUser({
        fullName: profile?.fullName ?? '',
        ...buildAddressPayload(values),
      }).unwrap();
      snackbar.success('Address updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update address.');
    }
  };

  const tenantLogoSrc = tenantSettings?.profileFileId
    ? getTenantLogoUrl(tenantSettings.profileFileId)
    : null;

  const onTenantLogoUpload = async (file: File) => {
    try {
      await uploadTenantLogo(file).unwrap();
      snackbar.success('Company logo updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to upload company logo.');
    }
  };

  const onTenantLogoRemove = async () => {
    try {
      await removeTenantLogo().unwrap();
      snackbar.success('Company logo removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove company logo.');
    }
  };

  const onCompanySubmit = async (values: CompanyValues) => {
    try {
      await updateTenantSettings({
        name: values.name,
        ...buildTenantAddressPayload(values),
      }).unwrap();
      snackbar.success('Company settings updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update company settings.');
    }
  };

  const avatarSrc = profile?.profileFileId ? getUserAvatarUrl(profile.id) : null;

  const onAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file).unwrap();
      snackbar.success('Profile picture updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to upload profile picture.');
    }
  };

  const onAvatarRemove = async () => {
    try {
      await removeAvatar().unwrap();
      snackbar.success('Profile picture removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove profile picture.');
    }
  };

  const handleLogout = async () => {
    await logoutMutation();
    navigate('/login', { replace: true });
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      snackbar.success('Password changed successfully.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to change password.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AccountCircleIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Profile
        </Typography>
      </Box>

      {/* Avatar + identity summary */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AvatarUpload
          src={avatarSrc}
          initials={initials}
          size={64}
          uploading={avatarUploading || avatarRemoving}
          onFileSelect={onAvatarUpload}
          onRemove={avatarSrc ? onAvatarRemove : undefined}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {profile?.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile?.email}
          </Typography>
          {profile?.systemRole && (
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
              {profile.systemRole}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v as number)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
        >
          <Tab label="Profile" icon={<AccountCircleIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Address" icon={<LocationOnIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Security" icon={<LockIcon fontSize="small" />} iconPosition="start" />
          {isTenantAdmin && (
            <Tab label="Company" icon={<BusinessIcon fontSize="small" />} iconPosition="start" />
          )}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* ── Tab 0: Profile ── */}
          {tab === 0 && (
            <Box>
              <LabelValue label="Email address" value={profile?.email} sx={{ mb: 2 }} />
              <Divider sx={{ mb: 2 }} />
              <FormBuilder
                key={profile?.id}
                schema={profileSchema}
                fields={profileFields}
                onSubmit={onProfileSubmit}
                submitText="Save changes"
                sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
              />
            </Box>
          )}

          {/* ── Tab 1: Address ── */}
          {tab === 1 && (
            <Box>
              <FormBuilder
                key={`address-${profile?.id}`}
                schema={addressSchema}
                fields={addressFields}
                onSubmit={onAddressSubmit}
                submitText="Save address"
                sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
              />
            </Box>
          )}

          {/* ── Tab 2: Security ── */}
          {tab === 2 && (
            <FormBuilder
              key="change-password"
              schema={passwordSchema}
              fields={passwordFields}
              onSubmit={onPasswordSubmit}
              submitText="Change password"
              sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
            />
          )}

          {/* ── Tab 3: Company (TenantAdmin only) ── */}
          {tab === 3 && isTenantAdmin && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <AvatarUpload
                  src={tenantLogoSrc}
                  initials={tenantSettings?.name?.[0]?.toUpperCase() ?? '?'}
                  size={64}
                  uploading={logoUploading || logoRemoving}
                  onFileSelect={onTenantLogoUpload}
                  onRemove={tenantLogoSrc ? onTenantLogoRemove : undefined}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Company logo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Square image recommended
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <FormBuilder
                key={`company-${tenantSettings?.id}`}
                schema={companySchema}
                fields={companyFields}
                onSubmit={onCompanySubmit}
                submitText="Save company settings"
                sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Sign out */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => setLogoutConfirmOpen(true)}
        >
          Sign out
        </Button>
      </Box>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Sign out?"
        description="You will be returned to the login page."
        confirmLabel="Sign out"
        loading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </Box>
  );
}
