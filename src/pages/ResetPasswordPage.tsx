import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  FIELD_TYPE,
  type FieldConfig,
  FormBuilder,
  type FormBuilderHandle,
} from 'mui-schema-form-builder';

import { useResetPasswordMutation, useValidateResetTokenQuery } from '@/features/auth/api/authApi';
import { Icon, LoadingButton } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';

import { styles } from './ResetPasswordPage.styles';
import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
  type TokenInvalidProps,
} from './ResetPasswordPage.types';

const resetFields: FieldConfig[] = [
  {
    name: 'password',
    label: 'New password',
    type: FIELD_TYPE.PASSWORD,
    required: true,
    muiProps: { autoComplete: 'new-password', autoFocus: true },
  },
  {
    name: 'confirmPassword',
    label: 'Confirm new password',
    type: FIELD_TYPE.PASSWORD,
    required: true,
    muiProps: { autoComplete: 'new-password' },
  },
];

const TokenInvalid = memo(({ message }: TokenInvalidProps) => {
  return (
    <Stack spacing={2} sx={styles.invalidStack}>
      <Box sx={styles.invalidIconBox}>
        <Icon name="Error" sx={styles.invalidIcon} />
      </Box>
      <Typography variant="h6" sx={styles.invalidTitle}>
        Link expired or invalid
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message || 'This password reset link is no longer valid.'}
      </Typography>
      <Button
        component={Link}
        to="/forgot-password"
        variant="contained"
        fullWidth
        size="large"
        sx={styles.invalidRequestButton}
      >
        Request a new link
      </Button>
      <Button component={Link} to="/login" variant="text" size="small">
        Back to sign in
      </Button>
    </Stack>
  );
});

const ResetSuccess = memo(() => {
  return (
    <Stack spacing={2} sx={styles.successStack}>
      <Box sx={styles.successIconBox}>
        <Icon name="CheckCircle" sx={styles.successIcon} />
      </Box>
      <Typography variant="h6" sx={styles.successTitle}>
        Password updated
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your password has been reset successfully. Sign in with your new password.
      </Typography>
      <Button
        component={Link}
        to="/login"
        variant="contained"
        fullWidth
        size="large"
        sx={styles.successButton}
      >
        Sign in
      </Button>
    </Stack>
  );
});

const ResetPasswordPage = memo(() => {
  const formRef = useRef<FormBuilderHandle>(null);
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const { data: validation, isLoading: isValidating } = useValidateResetTokenQuery(token, {
    skip: !token,
  });
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const [done, setDone] = useState(false);

  const onSubmit = useCallback(
    async (values: ResetPasswordFormValues) => {
      try {
        await resetPassword({
          token,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
        }).unwrap();
        setDone(true);
        snackbar.success('Password reset successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        const error = err as ApiError;
        snackbar.error(error.message || 'Failed to reset password. Please try again.');
      }
    },
    [resetPassword, token, snackbar, navigate],
  );

  const renderActions = useCallback(
    ({ isSubmitting }: { isSubmitting: boolean }) => (
      <LoadingButton
        type="submit"
        loading={isSubmitting || isResetting}
        variant="contained"
        fullWidth
        size="large"
        sx={styles.submitButton}
      >
        Reset password
      </LoadingButton>
    ),
    [isResetting],
  );

  const emailSubtitle = useMemo(() => {
    if (!validation?.email) return null;
    return (
      <Typography variant="body2" color="text.secondary" sx={styles.emailSubtitle}>
        Resetting password for{' '}
        <Box component="span" sx={styles.emailHighlight}>
          {validation.email}
        </Box>
      </Typography>
    );
  }, [validation?.email]);

  if (!token) return <TokenInvalid message="No reset token found in the link." />;

  if (isValidating) {
    return (
      <Box sx={styles.loadingBox}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!validation?.isValid) return <TokenInvalid message={validation?.errorMessage} />;

  if (done) return <ResetSuccess />;

  return (
    <Box>
      <Box sx={styles.titleRow}>
        <Box sx={styles.titleIconBox}>
          <Icon name="LockReset" sx={styles.titleIconSize} />
        </Box>
        <Typography variant="h6" sx={styles.titleText}>
          Set new password
        </Typography>
      </Box>
      {emailSubtitle}

      <FormBuilder
        ref={formRef}
        schema={resetPasswordSchema}
        fields={resetFields}
        onSubmit={onSubmit}
        renderActions={renderActions}
        sx={styles.formBuilder}
      />

      <Box sx={styles.backLinkBox}>
        <Button component={Link} to="/login" variant="text" size="small">
          Back to sign in
        </Button>
      </Box>
    </Box>
  );
});
export default ResetPasswordPage;
