import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { FIELD_TYPE, type FieldConfig, FormBuilder } from 'mui-schema-form-builder';

import { useForgotPasswordMutation } from '@/features/auth/api/authApi';
import { Icon, LoadingButton } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';

import { styles } from './ForgotPasswordPage.styles';
import { type ForgotPasswordFormValues, forgotPasswordSchema } from './ForgotPasswordPage.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const fields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Email address',
    type: FIELD_TYPE.TEXT,
    required: true,
    muiProps: { type: 'email', autoComplete: 'email', autoFocus: true },
  },
];

const variants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ForgotPasswordPage = memo(() => {
  const snackbar = useSnackbar();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const onSubmit = useCallback(
    async (values: ForgotPasswordFormValues) => {
      try {
        await forgotPassword({ email: values.email }).unwrap();
        setSentEmail(values.email);
        setSent(true);
      } catch (err) {
        const error = err as ApiError;
        snackbar.error(error.message || 'No account found with that email address.');
      }
    },
    [forgotPassword, snackbar],
  );

  const renderActions = useCallback(
    ({ isSubmitting }: { isSubmitting: boolean }) => (
      <LoadingButton
        type="submit"
        loading={isSubmitting || isLoading}
        variant="contained"
        fullWidth
        size="large"
        sx={styles.submitButton}
      >
        Send reset link
      </LoadingButton>
    ),
    [isLoading],
  );

  const handleTryDifferentEmail = useCallback(() => setSent(false), []);

  return (
    <Box sx={styles.root}>
      <AnimatePresence mode="wait" initial={false}>
        {!sent ? (
          <motion.div
            key="form"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <Box sx={styles.titleRow}>
              <Box sx={styles.titleIconBox}>
                <Icon name="Email" sx={styles.titleIconSize} />
              </Box>
              <Typography variant="h6" sx={styles.titleText}>
                Reset your password
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={styles.subtitle}>
              Enter the email address linked to your account. If it exists, we'll send a reset link.
            </Typography>

            <FormBuilder
              schema={forgotPasswordSchema}
              fields={fields}
              onSubmit={onSubmit}
              renderActions={renderActions}
              sx={styles.formBuilder}
            />

            <Box sx={styles.backLinkBox}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                size="small"
                startIcon={<Icon name="ArrowBack" fontSize="small" />}
              >
                Back to sign in
              </Button>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="sent"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <Stack spacing={2} sx={styles.sentStack}>
              <Box sx={styles.sentIconBox}>
                <Icon name="CheckCircle" sx={styles.sentIcon} />
              </Box>
              <Typography variant="h6" sx={styles.sentTitle}>
                Check your inbox
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If an account is linked to{' '}
                <Box component="span" sx={styles.sentEmailHighlight}>
                  {sentEmail}
                </Box>
                , a reset link has been sent. Check your spam folder if you don't see it.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                fullWidth
                size="large"
                sx={styles.sentBackButton}
              >
                Back to sign in
              </Button>
              <Button variant="text" size="small" onClick={handleTryDifferentEmail}>
                Try a different email
              </Button>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
});
export default ForgotPasswordPage;
