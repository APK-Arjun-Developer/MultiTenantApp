import { useMemo } from 'react';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { AvatarUpload } from '@/shared/components/AvatarUpload';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
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
import { useUpdateCurrentTenantAddressMutation } from '@/features/tenants/api/tenantsApi';
import type { ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
});
type ProfileValues = z.infer<typeof profileSchema>;

const addressSchema = z.object(addressZodShape);
type AddressValues = z.infer<typeof addressSchema>;

const tenantAddressSchema = z.object(tenantAddressZodShape);
type TenantAddressValues = z.infer<typeof tenantAddressSchema>;

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

  const { data: profile, isLoading } = useGetCurrentUserQuery();
  const [updateCurrentUser] = useUpdateCurrentUserMutation();
  const [updateCurrentTenantAddress] = useUpdateCurrentTenantAddressMutation();
  const [changePassword] = useChangePasswordMutation();
  const [uploadAvatar, { isLoading: avatarUploading }] = useUploadCurrentUserAvatarMutation();
  const [removeAvatar, { isLoading: avatarRemoving }] = useRemoveCurrentUserAvatarMutation();

  const isTenantAdmin = profile?.systemRole === 'TenantAdmin';

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

  const tenantAddressFields = useMemo<FieldConfig[]>(
    () => getTenantAddressFields(profile?.tenant?.address),
    [profile],
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

  const onTenantAddressSubmit = async (values: TenantAddressValues) => {
    try {
      await updateCurrentTenantAddress(buildTenantAddressPayload(values)).unwrap();
      snackbar.success('Company address updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update company address.');
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
    <Box sx={{ maxWidth: 560 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AccountCircleIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Profile
        </Typography>
      </Box>

      {/* ── Profile information ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Profile information
          </Typography>

          {/* Avatar + email read-only */}
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
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
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

          <TextField
            label="Email address"
            value={profile?.email ?? ''}
            fullWidth
            disabled
            size="small"
            sx={{ mb: 2 }}
            slotProps={{ input: { readOnly: true } }}
          />

          <Divider sx={{ mb: 2 }} />

          <FormBuilder
            key={profile?.id}
            schema={profileSchema}
            fields={profileFields}
            onSubmit={onProfileSubmit}
            submitText="Save changes"
            sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
          />
        </CardContent>
      </Card>

      {/* ── Address (user's own) ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isTenantAdmin ? 'My Address' : 'Address'}
            </Typography>
          </Box>

          <FormBuilder
            key={`address-${profile?.id}`}
            schema={addressSchema}
            fields={addressFields}
            onSubmit={onAddressSubmit}
            submitText="Save address"
            sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
          />
        </CardContent>
      </Card>

      {/* ── Company address (TenantAdmin only) ── */}
      {isTenantAdmin && profile?.tenant?.slug && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Company Address
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                {profile.tenant.name}
              </Typography>
            </Box>

            <FormBuilder
              key={`tenant-address-${profile.id}`}
              schema={tenantAddressSchema}
              fields={tenantAddressFields}
              onSubmit={onTenantAddressSubmit}
              submitText="Save company address"
              sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Change password ── */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LockIcon fontSize="small" color="action" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Change password
            </Typography>
          </Box>

          <FormBuilder
            key="change-password"
            schema={passwordSchema}
            fields={passwordFields}
            onSubmit={onPasswordSubmit}
            submitText="Change password"
            sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
