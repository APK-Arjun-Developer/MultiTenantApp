import { useState } from 'react';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { FormWizard, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import {
  useValidateInvitationQuery,
  useAcceptTenantAdminInvitationMutation,
  useAcceptTenantUserInvitationMutation,
} from '@/features/auth/api/authApi';
import { PASSWORD_FIELD } from '@/shared/components/PasswordField';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import {
  addressZodShape,
  getAddressFields,
  buildAddressPayload,
} from '@/shared/forms/addressFields';
import type { AcceptInvitationResponse, ApiError } from '@/types/api';

// ─── Schema ───────────────────────────────────────────────────────────────────

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const inviteSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string().optional(),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    ...addressZodShape,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof inviteSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function InvitationInvalid({ message }: { message?: string | null }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Invitation expired or invalid
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message || 'This invitation link is no longer valid. Please contact your administrator.'}
      </Typography>
      <Button
        component={Link}
        to="/login"
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 1 }}
      >
        Go to sign in
      </Button>
    </Stack>
  );
}

function InvitationSuccess({ result }: { result: AcceptInvitationResponse }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Account created!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Welcome,{' '}
        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {result.fullName}
        </Box>
        . Your account is ready.
        {result.roles.length > 0 && (
          <>
            {' '}
            You have been assigned the role{result.roles.length > 1 ? 's' : ''}:{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {result.roles.join(', ')}
            </Box>
            .
          </>
        )}
      </Typography>
      <Button
        component={Link}
        to={result.tenantSlug ? `/login?slug=${result.tenantSlug}` : '/login'}
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 1 }}
      >
        Sign in
      </Button>
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function InvitationPage() {
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { data: validation, isLoading: isValidating } = useValidateInvitationQuery(token, {
    skip: !token,
  });

  const [acceptAdmin, { isLoading: isAcceptingAdmin }] = useAcceptTenantAdminInvitationMutation();
  const [acceptUser, { isLoading: isAcceptingUser }] = useAcceptTenantUserInvitationMutation();

  const [result, setResult] = useState<AcceptInvitationResponse | null>(null);

  const isSubmitting = isAcceptingAdmin || isAcceptingUser;
  // Server may return 'TenantAdmin' (string, with JsonStringEnumConverter) or 1 (integer,
  // legacy/unconfigured). Handle both so the UI works regardless of server build state.
  const rawInvType: unknown = validation?.invitationType;
  const isAdmin = rawInvType === 'TenantAdmin' || rawInvType === 1;

  const profileFields: FieldConfig[] = [
    {
      name: 'fullName',
      label: 'Full name',
      type: FIELD_TYPE.TEXT,
      required: true,
      muiProps: { autoComplete: 'name', autoFocus: true },
    },
    {
      name: 'phone',
      label: 'Phone (optional)',
      type: FIELD_TYPE.TEXT,
      muiProps: { autoComplete: 'tel' },
    },
    {
      name: 'password',
      label: 'Password',
      type: PASSWORD_FIELD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm password',
      type: PASSWORD_FIELD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
  ];

  const addressFields: FieldConfig[] = getAddressFields();

  const onSubmit = async (values: FormValues) => {
    try {
      const currentType: unknown = validation?.invitationType;
      const submitAsAdmin = currentType === 'TenantAdmin' || currentType === 1;

      const addressPayload = buildAddressPayload(values);
      const payload = {
        token,
        fullName: values.fullName,
        phone: values.phone || undefined,
        password: values.password,
        confirmPassword: values.confirmPassword,
        ...addressPayload,
      };

      let response: AcceptInvitationResponse;
      if (submitAsAdmin) {
        response = await acceptAdmin(payload).unwrap();
      } else {
        response = await acceptUser(payload).unwrap();
      }

      setResult(response);
    } catch (err) {
      snackbar.error(
        (err as ApiError).message || 'Failed to accept invitation. The link may have expired.',
      );
    }
  };

  if (!token) return <InvitationInvalid message="No invitation token found in the link." />;

  if (isValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!validation?.isValid) return <InvitationInvalid message={validation?.errorMessage} />;

  if (result) return <InvitationSuccess result={result} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <PersonAddIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Accept invitation
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        You've been invited to join
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {validation.tenantName}
        </Typography>
        <Chip
          label={isAdmin ? 'Admin' : 'User'}
          size="small"
          color={isAdmin ? 'primary' : 'default'}
          variant="outlined"
        />
      </Box>

      {/* Pre-filled email — display only, not part of the submitted form */}
      <TextField
        label="Email address"
        value={validation.email ?? ''}
        fullWidth
        disabled
        sx={{ mb: 2 }}
        slotProps={{ input: { readOnly: true } }}
      />

      <FormWizard
        key={token}
        schema={inviteSchema}
        steps={[
          {
            label: 'Your profile',
            description: 'Name and password',
            fields: profileFields,
          },
          {
            label: 'Address',
            description: 'Optional — you can add this later',
            fields: addressFields,
          },
        ]}
        onSubmit={onSubmit}
        submitText={isSubmitting ? 'Creating account…' : 'Create account'}
        sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
      />
    </Box>
  );
}
