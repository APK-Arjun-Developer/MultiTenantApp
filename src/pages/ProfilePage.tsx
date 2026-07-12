import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  getAddressFields,
  buildAddressPayload,
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
import { styles } from './ProfilePage.styles';
import type {
  ProfileValues,
  AddressValues,
  PasswordValues,
  CompanyValues,
  ProfileAvatarSectionProps,
  ProfileInfoSectionProps,
  ProfileAddressSectionProps,
  ProfilePasswordSectionProps,
  ProfileCompanySectionProps,
} from './ProfilePage.types';
import { profileSchema, addressSchema, companySchema, passwordSchema } from './ProfilePage.types';

// ─── Static field configs (no runtime deps, defined once) ─────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProfileAvatarSection = memo(function ProfileAvatarSection({
  avatarSrc,
  initials,
  avatarUploading,
  avatarRemoving,
  fullName,
  email,
  systemRole,
  onAvatarUpload,
  onAvatarRemove,
}: ProfileAvatarSectionProps) {
  return (
    <Box sx={styles.avatarContainer}>
      <AvatarUpload
        src={avatarSrc}
        initials={initials}
        size={64}
        uploading={avatarUploading || avatarRemoving}
        onFileSelect={onAvatarUpload}
        onRemove={avatarSrc ? onAvatarRemove : undefined}
      />
      <Box>
        <Typography variant="subtitle1" sx={styles.userName}>
          {fullName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {email}
        </Typography>
        {systemRole && (
          <Typography variant="caption" color="primary.main" sx={styles.systemRole}>
            {systemRole}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

const ProfileInfoSection = memo(function ProfileInfoSection({
  profileId,
  email,
  profileFields,
  onProfileSubmit,
}: ProfileInfoSectionProps) {
  return (
    <Box>
      <LabelValue label="Email address" value={email} sx={styles.emailLabelValue} />
      <Divider sx={styles.divider} />
      <FormBuilder
        key={profileId}
        schema={profileSchema}
        fields={profileFields}
        onSubmit={onProfileSubmit}
        submitText="Save changes"
        sx={styles.inlineForm as never}
      />
    </Box>
  );
});

const ProfileAddressSection = memo(function ProfileAddressSection({
  profileId,
  addressFields,
  onAddressSubmit,
}: ProfileAddressSectionProps) {
  return (
    <Box>
      <FormBuilder
        key={`address-${profileId}`}
        schema={addressSchema}
        fields={addressFields}
        onSubmit={onAddressSubmit}
        submitText="Save address"
        sx={styles.inlineForm as never}
      />
    </Box>
  );
});

const ProfilePasswordSection = memo(function ProfilePasswordSection({
  passwordFields: pwFields,
  onPasswordSubmit,
}: ProfilePasswordSectionProps) {
  return (
    <FormBuilder
      key="change-password"
      schema={passwordSchema}
      fields={pwFields}
      onSubmit={onPasswordSubmit}
      submitText="Change password"
      sx={styles.inlineForm as never}
    />
  );
});

const ProfileCompanySection = memo(function ProfileCompanySection({
  tenantSettings,
  tenantLogoSrc,
  logoUploading,
  logoRemoving,
  companyFields,
  onTenantLogoUpload,
  onTenantLogoRemove,
  onCompanySubmit,
}: ProfileCompanySectionProps) {
  return (
    <Box>
      <Box sx={styles.companyLogoRow}>
        <AvatarUpload
          src={tenantLogoSrc}
          initials={tenantSettings?.name?.[0]?.toUpperCase() ?? '?'}
          size={64}
          uploading={logoUploading || logoRemoving}
          onFileSelect={onTenantLogoUpload}
          onRemove={tenantLogoSrc ? onTenantLogoRemove : undefined}
        />
        <Box>
          <Typography variant="subtitle2" sx={styles.companyLogoLabel}>
            Company logo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Square image recommended
          </Typography>
        </Box>
      </Box>
      <Divider sx={styles.companyDivider} />
      <FormBuilder
        key={`company-${tenantSettings?.id}`}
        schema={companySchema}
        fields={companyFields}
        onSubmit={onCompanySubmit}
        submitText="Save company settings"
        sx={styles.inlineForm as never}
      />
    </Box>
  );
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export const ProfilePage = memo(function ProfilePage() {
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

  const initials = useMemo(() => {
    if (!profile?.fullName) return '?';
    return profile.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [profile?.fullName]);

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

  const avatarSrc = useMemo(
    () => (profile?.profileFileId ? getUserAvatarUrl(profile.id) : null),
    [profile?.profileFileId, profile?.id],
  );

  const tenantLogoSrc = useMemo(
    () => (tenantSettings?.profileFileId ? getTenantLogoUrl(tenantSettings.profileFileId) : null),
    [tenantSettings?.profileFileId],
  );

  const handleTabChange = useCallback((_e: React.SyntheticEvent, v: unknown) => {
    setTab(v as number);
  }, []);

  const onProfileSubmit = useCallback(
    async (values: ProfileValues) => {
      try {
        await updateCurrentUser({ fullName: values.fullName }).unwrap();
        snackbar.success('Profile updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to update profile.');
      }
    },
    [updateCurrentUser, snackbar],
  );

  const onAddressSubmit = useCallback(
    async (values: AddressValues) => {
      try {
        await updateCurrentUser({
          fullName: profile?.fullName ?? '',
          ...buildAddressPayload(values),
        }).unwrap();
        snackbar.success('Address updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to update address.');
      }
    },
    [updateCurrentUser, profile?.fullName, snackbar],
  );

  const onAvatarUpload = useCallback(
    async (file: File) => {
      try {
        await uploadAvatar(file).unwrap();
        snackbar.success('Profile picture updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to upload profile picture.');
      }
    },
    [uploadAvatar, snackbar],
  );

  const onAvatarRemove = useCallback(async () => {
    try {
      await removeAvatar().unwrap();
      snackbar.success('Profile picture removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove profile picture.');
    }
  }, [removeAvatar, snackbar]);

  const onTenantLogoUpload = useCallback(
    async (file: File) => {
      try {
        await uploadTenantLogo(file).unwrap();
        snackbar.success('Company logo updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to upload company logo.');
      }
    },
    [uploadTenantLogo, snackbar],
  );

  const onTenantLogoRemove = useCallback(async () => {
    try {
      await removeTenantLogo().unwrap();
      snackbar.success('Company logo removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove company logo.');
    }
  }, [removeTenantLogo, snackbar]);

  const onCompanySubmit = useCallback(
    async (values: CompanyValues) => {
      try {
        await updateTenantSettings({
          name: values.name,
          ...buildTenantAddressPayload(values),
        }).unwrap();
        snackbar.success('Company settings updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to update company settings.');
      }
    },
    [updateTenantSettings, snackbar],
  );

  const onPasswordSubmit = useCallback(
    async (values: PasswordValues) => {
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
    },
    [changePassword, snackbar],
  );

  const handleLogout = useCallback(async () => {
    await logoutMutation();
    navigate('/login', { replace: true });
  }, [logoutMutation, navigate]);

  const openLogoutConfirm = useCallback(() => setLogoutConfirmOpen(true), []);
  const closeLogoutConfirm = useCallback(() => setLogoutConfirmOpen(false), []);

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={styles.root}>
      {/* Page header */}
      <Box sx={styles.pageHeader}>
        <AccountCircleIcon color="primary" />
        <Typography variant="h5" sx={styles.pageTitle}>
          Profile
        </Typography>
      </Box>

      {/* Avatar + identity summary */}
      <ProfileAvatarSection
        avatarSrc={avatarSrc}
        initials={initials}
        avatarUploading={avatarUploading}
        avatarRemoving={avatarRemoving}
        fullName={profile?.fullName}
        email={profile?.email}
        systemRole={profile?.systemRole}
        onAvatarUpload={onAvatarUpload}
        onAvatarRemove={onAvatarRemove}
      />

      {/* Tabs */}
      <Paper variant="outlined" sx={styles.tabsPaper}>
        <Tabs value={tab} onChange={handleTabChange} sx={styles.tabs}>
          <Tab label="Profile" icon={<AccountCircleIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Address" icon={<LocationOnIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Security" icon={<LockIcon fontSize="small" />} iconPosition="start" />
          {isTenantAdmin && (
            <Tab label="Company" icon={<BusinessIcon fontSize="small" />} iconPosition="start" />
          )}
        </Tabs>

        <Box sx={styles.tabPanel}>
          {/* ── Tab 0: Profile ── */}
          {tab === 0 && (
            <ProfileInfoSection
              profileId={profile?.id}
              email={profile?.email}
              profileFields={profileFields}
              onProfileSubmit={onProfileSubmit}
            />
          )}

          {/* ── Tab 1: Address ── */}
          {tab === 1 && (
            <ProfileAddressSection
              profileId={profile?.id}
              addressFields={addressFields}
              onAddressSubmit={onAddressSubmit}
            />
          )}

          {/* ── Tab 2: Security ── */}
          {tab === 2 && (
            <ProfilePasswordSection
              passwordFields={passwordFields}
              onPasswordSubmit={onPasswordSubmit}
            />
          )}

          {/* ── Tab 3: Company (TenantAdmin only) ── */}
          {tab === 3 && isTenantAdmin && (
            <ProfileCompanySection
              tenantSettings={tenantSettings}
              tenantLogoSrc={tenantLogoSrc}
              logoUploading={logoUploading}
              logoRemoving={logoRemoving}
              companyFields={companyFields}
              onTenantLogoUpload={onTenantLogoUpload}
              onTenantLogoRemove={onTenantLogoRemove}
              onCompanySubmit={onCompanySubmit}
            />
          )}
        </Box>
      </Paper>

      {/* Sign out */}
      <Box sx={styles.actionRow}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={openLogoutConfirm}
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
        onCancel={closeLogoutConfirm}
      />
    </Box>
  );
});
