import { useState } from 'react';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { useForgotPasswordMutation } from '@/features/auth/api/authApi';
import { LoadingButton } from '@/shared/components/LoadingButton';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});
type FormValues = z.infer<typeof schema>;

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

export function ForgotPasswordPage() {
  const snackbar = useSnackbar();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      setSentEmail(values.email);
      setSent(true);
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'No account found with that email address.');
    }
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <EmailIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Reset your password
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the email address linked to your account. If it exists, we'll send a reset link.
            </Typography>

            <FormBuilder
              schema={schema}
              fields={fields}
              onSubmit={onSubmit}
              renderActions={({ isSubmitting }) => (
                <LoadingButton
                  type="submit"
                  loading={isSubmitting || isLoading}
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 1 }}
                >
                  Send reset link
                </LoadingButton>
              )}
              sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
            />

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
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
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Check your inbox
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If an account is linked to{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
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
                sx={{ mt: 1 }}
              >
                Back to sign in
              </Button>
              <Button variant="text" size="small" onClick={() => setSent(false)}>
                Try a different email
              </Button>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
