import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { AvatarManageModal, ConfirmDialog, LabelValue, Icon } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { useUrlTabs, useBooleanDialog } from '@/shared/hooks';
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
import {
  profileSchema,
  addressSchema,
  companySchema,
  passwordSchema,
  type ProfileValues,
  type AddressValues,
  type PasswordValues,
  type CompanyValues,
  type ProfileAvatarSectionProps,
  type ProfileInfoSectionProps,
  type ProfileAddressSectionProps,
  type ProfilePasswordSectionProps,
  type ProfileCompanySectionProps,
} from './ProfilePage.types';

// ─── Static field configs ──────────────────────────────────────────────────────

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

const PROFILE_TABS = ['profile', 'address', 'security', 'company'] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProfileAvatarSection = memo(
  ({
    avatarSrc,
    initials,
    fullName,
    email,
    systemRole,
    onOpenModal,
  }: ProfileAvatarSectionProps) => {
    const [hover, setHover] = useState(false);

    return (
      <Box sx={styles.avatarContainer}>
        <Box
          sx={styles.avatarClickable}
          onClick={onOpenModal}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Avatar
            src={avatarSrc ?? undefined}
            slotProps={{ img: { crossOrigin: 'use-credentials' } }}
            sx={styles.avatarMedium}
          >
            {!avatarSrc && initials}
          </Avatar>
          {hover && (
            <Box sx={styles.avatarOverlay}>
              <Icon name="CameraAlt" sx={styles.avatarOverlayIcon} />
            </Box>
          )}
        </Box>
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
  },
);

const ProfileInfoSection = memo(
  ({ profileId, email, profileFields, onProfileSubmit }: ProfileInfoSectionProps) => {
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
          sx={styles.inlineForm}
        />
      </Box>
    );
  },
);

const ProfileAddressSection = memo(
  ({ profileId, addressFields, onAddressSubmit }: ProfileAddressSectionProps) => {
    return (
      <Box>
        <FormBuilder
          key={`address-${profileId}`}
          schema={addressSchema}
          fields={addressFields}
          onSubmit={onAddressSubmit}
          submitText="Save address"
          sx={styles.inlineForm}
        />
      </Box>
    );
  },
);

const ProfilePasswordSection = memo(
  ({ passwordFields, onPasswordSubmit }: ProfilePasswordSectionProps) => {
    return (
      <FormBuilder
        key="change-password"
        schema={passwordSchema}
        fields={passwordFields}
        onSubmit={onPasswordSubmit}
        submitText="Change password"
        sx={styles.inlineForm}
      />
    );
  },
);

const ProfileCompanySection = memo(
  ({
    tenantSettings,
    tenantLogoSrc,
    companyFields,
    onOpenLogoModal,
    onCompanySubmit,
  }: ProfileCompanySectionProps) => {
    const [hover, setHover] = useState(false);
    const logoInitial = tenantSettings?.name?.[0]?.toUpperCase() ?? '?';

    return (
      <Box>
        <Box sx={styles.companyLogoRow}>
          <Box
            sx={styles.avatarClickable}
            onClick={onOpenLogoModal}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Avatar
              src={tenantLogoSrc ?? undefined}
              slotProps={{ img: { crossOrigin: 'use-credentials' } }}
              sx={styles.avatarMedium}
            >
              {!tenantLogoSrc && logoInitial}
            </Avatar>
            {hover && (
              <Box sx={styles.avatarOverlay}>
                <Icon name="CameraAlt" sx={styles.avatarOverlayIcon} />
              </Box>
            )}
          </Box>
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
          sx={styles.inlineForm}
        />
      </Box>
    );
  },
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProfilePage = memo(() => {
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const { tab, handleTabChange } = useUrlTabs(PROFILE_TABS);
  const logoutDialog = useBooleanDialog();
  const avatarModal = useBooleanDialog();
  const companyLogoModal = useBooleanDialog();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data: profile, isLoading } = useGetCurrentUserQuery();
  const [updateCurrentUser] = useUpdateCurrentUserMutation();
  const [changePassword] = useChangePasswordMutation();
  const [uploadAvatar, { isLoading: avatarUploading }] = useUploadCurrentUserAvatarMutation();
  const [removeAvatar, { isLoading: avatarRemoving }] = useRemoveCurrentUserAvatarMutation();

  const isTenantAdmin = profile?.systemRole === 'TenantAdmin';
  // Clamp tab to valid range — non-TenantAdmin users have no Company tab (index 3)
  const activeTab = !isTenantAdmin && tab === 3 ? 0 : tab;
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
    void navigate('/login', { replace: true });
  }, [logoutMutation, navigate]);

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
        <Box sx={styles.pageIconBox}>
          <Icon name="AccountCircle" sx={styles.pageIconSize} />
        </Box>
        <Typography variant="h5" sx={styles.pageTitle}>
          Profile
        </Typography>
      </Box>

      {/* Avatar + identity summary */}
      <ProfileAvatarSection
        avatarSrc={avatarSrc}
        initials={initials}
        fullName={profile?.fullName}
        email={profile?.email}
        systemRole={profile?.systemRole}
        onOpenModal={avatarModal.onOpen}
      />

      {/* Tabs */}
      <Paper variant="outlined" sx={styles.tabsPaper}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={styles.tabs}>
          <Tab
            label="Profile"
            icon={<Icon name="AccountCircle" fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Address"
            icon={<Icon name="LocationOn" fontSize="small" />}
            iconPosition="start"
          />
          <Tab label="Security" icon={<Icon name="Lock" fontSize="small" />} iconPosition="start" />
          {isTenantAdmin && (
            <Tab
              label="Company"
              icon={<Icon name="Business" fontSize="small" />}
              iconPosition="start"
            />
          )}
        </Tabs>

        <Box sx={styles.tabPanel}>
          {activeTab === 0 && (
            <ProfileInfoSection
              profileId={profile?.id}
              email={profile?.email}
              profileFields={profileFields}
              onProfileSubmit={onProfileSubmit}
            />
          )}
          {activeTab === 1 && (
            <ProfileAddressSection
              profileId={profile?.id}
              addressFields={addressFields}
              onAddressSubmit={onAddressSubmit}
            />
          )}
          {activeTab === 2 && (
            <ProfilePasswordSection
              passwordFields={passwordFields}
              onPasswordSubmit={onPasswordSubmit}
            />
          )}
          {activeTab === 3 && isTenantAdmin && (
            <ProfileCompanySection
              tenantSettings={tenantSettings}
              tenantLogoSrc={tenantLogoSrc}
              companyFields={companyFields}
              onOpenLogoModal={companyLogoModal.onOpen}
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
          startIcon={<Icon name="Logout" />}
          onClick={logoutDialog.onOpen}
        >
          Sign out
        </Button>
      </Box>

      {/* Profile photo modal */}
      <AvatarManageModal
        open={avatarModal.open}
        onClose={avatarModal.onClose}
        src={avatarSrc}
        initials={initials}
        title="Profile photo"
        uploading={avatarUploading || avatarRemoving}
        onUpload={onAvatarUpload}
        onRemove={avatarSrc ? onAvatarRemove : undefined}
      />

      {/* Company logo modal */}
      <AvatarManageModal
        open={companyLogoModal.open}
        onClose={companyLogoModal.onClose}
        src={tenantLogoSrc}
        initials={tenantSettings?.name?.[0]?.toUpperCase() ?? '?'}
        title="Company logo"
        uploading={logoUploading || logoRemoving}
        onUpload={onTenantLogoUpload}
        onRemove={tenantLogoSrc ? onTenantLogoRemove : undefined}
      />

      {/* Sign-out confirmation */}
      <ConfirmDialog
        open={logoutDialog.open}
        title="Sign out?"
        description="You will be returned to the login page."
        confirmLabel="Sign out"
        loading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={logoutDialog.onClose}
      />
    </Box>
  );
});
export default ProfilePage;
