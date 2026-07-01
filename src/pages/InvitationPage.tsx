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
  useAcceptTenantCreationInvitationMutation,
} from '@/features/auth/api/authApi';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import {
  requiredAddressZodShape,
  getAddressFields,
  buildAddressPayload,
  requiredTenantAddressZodShape,
  getTenantAddressFields,
  buildTenantAddressPayload,
} from '@/shared/forms/addressFields';
import type { AcceptInvitationResponse, ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

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
    ...requiredAddressZodShape,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof inviteSchema>;

const tenantCreationSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string().optional(),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    tenantName: z.string().min(1, 'Tenant name is required').max(200),
    tenantSlug: z
      .string()
      .min(1, 'Slug is required')
      .max(100)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Lowercase letters, digits and hyphens only (e.g. my-company)',
      ),
    ...requiredTenantAddressZodShape,
    ...requiredAddressZodShape,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type TenantCreationValues = z.infer<typeof tenantCreationSchema>;

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
  const [acceptNewTenant, { isLoading: isAcceptingNewTenant }] =
    useAcceptTenantCreationInvitationMutation();

  const [result, setResult] = useState<AcceptInvitationResponse | null>(null);

  const isSubmitting = isAcceptingAdmin || isAcceptingUser || isAcceptingNewTenant;

  const rawInvType: unknown = validation?.invitationType;
  const isAdmin = rawInvType === 'TenantAdmin' || rawInvType === 1;
  const isNewTenant = rawInvType === 'NewTenant' || rawInvType === 3;

  // ── Fields for admin / user flows ────────────────────────────────────────

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
      label: 'Phone',
      type: FIELD_TYPE.TEXT,
      muiProps: { autoComplete: 'tel' },
    },
    {
      name: 'password',
      label: 'Password',
      type: FIELD_TYPE.PASSWORD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm password',
      type: FIELD_TYPE.PASSWORD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
  ];

  const addressFields: FieldConfig[] = getAddressFields(undefined, undefined, true);

  // ── Fields for new-tenant flow ────────────────────────────────────────────

  const newTenantAccountFields: FieldConfig[] = [
    {
      name: 'fullName',
      label: 'Full name',
      type: FIELD_TYPE.TEXT,
      required: true,
      muiProps: { autoComplete: 'name', autoFocus: true },
    },
    {
      name: 'phone',
      label: 'Phone',
      type: FIELD_TYPE.TEXT,
      muiProps: { autoComplete: 'tel' },
    },
    {
      name: 'password',
      label: 'Password',
      type: FIELD_TYPE.PASSWORD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm password',
      type: FIELD_TYPE.PASSWORD,
      required: true,
      muiProps: { autoComplete: 'new-password' },
    },
  ];

  const newTenantDetailsFields: FieldConfig[] = [
    {
      name: 'tenantName',
      label: 'Company / tenant name',
      type: FIELD_TYPE.TEXT,
      required: true,
    },
    {
      name: 'tenantSlug',
      label: 'Slug',
      type: FIELD_TYPE.TEXT,
      required: true,
      muiProps: {
        helperText: 'URL-safe identifier — lowercase letters, digits and hyphens (e.g. my-company)',
      },
    },
    ...getTenantAddressFields(undefined, undefined, true),
  ];

  const newTenantUserAddressFields: FieldConfig[] = getAddressFields(undefined, undefined, true);

  // ── Submit handlers ───────────────────────────────────────────────────────

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

  const onSubmitNewTenant = async (values: TenantCreationValues) => {
    try {
      const tenantAddressPayload = buildTenantAddressPayload(values);
      const userAddressPayload = buildAddressPayload(values);

      const response = await acceptNewTenant({
        token,
        fullName: values.fullName,
        phone: values.phone || undefined,
        password: values.password,
        confirmPassword: values.confirmPassword,
        tenantName: values.tenantName,
        tenantSlug: values.tenantSlug,
        ...(tenantAddressPayload.address ? { tenantAddress: tenantAddressPayload.address } : {}),
        ...(userAddressPayload.address ? { userAddress: userAddressPayload.address } : {}),
      }).unwrap();

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

  // ── New Tenant invitation UI ──────────────────────────────────────────────

  if (isNewTenant) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create your tenant account
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You've been invited to set up a new tenant on this platform.
        </Typography>

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
          schema={tenantCreationSchema}
          steps={[
            {
              label: 'Your account',
              description: 'Name and password',
              fields: newTenantAccountFields,
            },
            {
              label: 'Tenant details',
              description: 'Company name and slug',
              fields: newTenantDetailsFields,
            },
            {
              label: 'Your address',
              description: 'Personal address',
              fields: newTenantUserAddressFields,
            },
          ]}
          onSubmit={onSubmitNewTenant}
          submitText={isSubmitting ? 'Creating account…' : 'Create tenant & account'}
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </Box>
    );
  }

  // ── Admin / User invitation UI ────────────────────────────────────────────

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
            description: 'Personal address',
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
