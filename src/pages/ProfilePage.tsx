import { useMemo } from 'react';
import { z } from 'zod';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { PASSWORD_FIELD } from '@/shared/components/PasswordField';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
} from '@/features/users/api/usersApi';
import type { ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
});
type ProfileValues = z.infer<typeof profileSchema>;

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
  const [changePassword] = useChangePasswordMutation();

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
      type: PASSWORD_FIELD,
      required: true,
      muiProps: { autoComplete: 'current-password' },
    },
    {
      name: 'newPassword',
      label: 'New password',
      type: PASSWORD_FIELD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm new password',
      type: PASSWORD_FIELD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
  ];

  const onProfileSubmit = async (values: ProfileValues) => {
    try {
      await updateCurrentUser({ fullName: values.fullName }).unwrap();
      snackbar.success('Profile updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update profile.');
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
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}>
              {initials}
            </Avatar>
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
