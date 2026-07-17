import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FIELD_TYPE,
  type FieldConfig,
  FormBuilder,
  type FormBuilderHandle,
} from 'mui-schema-form-builder';

import { useAppSelector } from '@/app/hooks';
import {
  useLoginMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '@/features/auth/api/authApi';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';
import { Icon, LoadingButton } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';

import { otpInputStyle, styles } from './LoginPage.styles';
import { loginSchema, type LoginValues, type OtpInputProps, type Step } from './LoginPage.types';

const OTP_LENGTH = 6;

const loginFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Email address',
    type: FIELD_TYPE.TEXT,
    required: true,
    muiProps: { type: 'email', autoComplete: 'email', autoFocus: true },
  },
  {
    name: 'password',
    label: 'Password',
    type: FIELD_TYPE.PASSWORD,
    required: true,
    muiProps: { autoComplete: 'current-password' },
  },
];

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

const OtpInput = memo(({ value, onChange, disabled }: OtpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = useMemo(
    () => value.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH),
    [value],
  );

  const update = useCallback(
    (nextDigits: string[]) => onChange(nextDigits.join('').trimEnd()),
    [onChange],
  );

  const handleChange = useCallback(
    (i: number, raw: string) => {
      const digit = raw.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[i] = digit;
      update(next);
      if (digit && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
    },
    [digits, update],
  );

  const handleKeyDown = useCallback(
    (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[i]) {
          const next = [...digits];
          next[i] = '';
          update(next);
        } else if (i > 0) {
          inputRefs.current[i - 1]?.focus();
        }
      } else if (e.key === 'ArrowLeft' && i > 0) {
        inputRefs.current[i - 1]?.focus();
      } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
        inputRefs.current[i + 1]?.focus();
      }
    },
    [digits, update],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (!pasted) return;
      const next = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((ch, i) => {
        next[i] = ch;
      });
      update(next);
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    },
    [update],
  );

  return (
    <Box sx={styles.otpInputRow}>
      {digits.map((digit, i) => (
        <InputBase
          key={i}
          inputRef={(el) => {
            inputRefs.current[i] = el;
          }}
          value={digit}
          disabled={disabled}
          inputProps={{
            maxLength: 1,
            inputMode: 'numeric',
            pattern: '[0-9]*',
            style: otpInputStyle,
          }}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e as React.KeyboardEvent<HTMLInputElement>)}
          onPaste={handlePaste}
          sx={styles.otpDigitBox(!!digit)}
        />
      ))}
    </Box>
  );
});

const LoginPage = memo(() => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyEmailMutation, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationMutation, { isLoading: isResending }] = useResendVerificationMutation();

  const loginRef = useRef<FormBuilderHandle>(null);
  const snackbar = useSnackbar();

  const [step, setStep] = useState<Step>('login');
  const [direction, setDirection] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const goToVerify = useCallback((email: string) => {
    setDirection(1);
    setPendingEmail(email);
    setOtp('');
    setStep('verify');
  }, []);

  const goToLogin = useCallback(() => {
    setDirection(-1);
    setStep('login');
    setOtp('');
  }, []);

  const sendOtp = useCallback(
    async (email: string, silent = false) => {
      try {
        await resendVerificationMutation({ email }).unwrap();
        setCooldown(60);
        if (!silent) snackbar.success('A new code has been sent to your email.');
      } catch {
        // server always returns 200 for this endpoint — failure is infra-level
      }
    },
    [resendVerificationMutation, snackbar],
  );

  const onLoginSubmit = useCallback(
    async (values: LoginValues) => {
      try {
        await loginMutation({ email: values.email, password: values.password }).unwrap();
      } catch (err) {
        const error = err as ApiError;
        if (error.status === 400 && error.message?.includes('not been verified')) {
          goToVerify(values.email);
          await sendOtp(values.email, true);
        } else {
          snackbar.error(
            error.message || 'Invalid credentials. Please check your email and password.',
          );
        }
      }
    },
    [loginMutation, goToVerify, sendOtp, snackbar],
  );

  const onVerifySubmit = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) return;
    try {
      await verifyEmailMutation({ email: pendingEmail, otp }).unwrap();
      snackbar.success('Email verified! You can now sign in.');
      goToLogin();
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Invalid or expired verification code.');
    }
  }, [otp, verifyEmailMutation, pendingEmail, snackbar, goToLogin]);

  const handleVerifyFormSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      void onVerifySubmit();
    },
    [onVerifySubmit],
  );

  const handleResendOtp = useCallback(() => sendOtp(pendingEmail), [sendOtp, pendingEmail]);

  const renderLoginActions = useCallback(
    ({ isSubmitting }: { isSubmitting: boolean }) => (
      <LoadingButton
        type="submit"
        loading={isSubmitting || isLoggingIn}
        variant="contained"
        fullWidth
        size="large"
        sx={styles.loginSubmitButton}
      >
        Sign in
      </LoadingButton>
    ),
    [isLoggingIn],
  );

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <Box sx={styles.root}>
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {step === 'login' ? (
          <motion.div
            key="login"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Typography variant="h6" sx={styles.loginTitle}>
              Sign in to your account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={styles.loginSubtitle}>
              Enter your credentials to continue
            </Typography>

            <FormBuilder
              ref={loginRef}
              schema={loginSchema}
              fields={loginFields}
              onSubmit={onLoginSubmit}
              renderActions={renderLoginActions}
              sx={styles.loginFormBuilder}
            />

            <Box sx={styles.forgotPasswordLink}>
              <Typography
                component={Link}
                to="/forgot-password"
                variant="body2"
                sx={styles.forgotPasswordAnchor}
              >
                Forgot password?
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Box>
              <IconButton onClick={goToLogin} size="small" sx={styles.verifyBackButton}>
                <Icon name="ArrowBack" fontSize="small" />
              </IconButton>

              <Box sx={styles.verifyTitleRow}>
                <Box sx={styles.titleIconBox}>
                  <Icon name="MarkEmailRead" sx={styles.verifyTitleIconSize} />
                </Box>
                <Typography variant="h6" sx={styles.verifyTitleText}>
                  Verify your email
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={styles.verifySubtitle}>
                We sent a 6-digit code to{' '}
                <Box component="span" sx={styles.verifyEmailHighlight}>
                  {pendingEmail}
                </Box>
                . Enter it below to confirm your address.
              </Typography>

              <Stack component="form" spacing={3} onSubmit={handleVerifyFormSubmit}>
                <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />

                <LoadingButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={otp.length !== OTP_LENGTH}
                  loading={isVerifying}
                >
                  Verify email
                </LoadingButton>

                <Box sx={styles.resendBox}>
                  {cooldown > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Resend code in{' '}
                      <Box component="span" sx={styles.cooldownHighlight}>
                        {cooldown}s
                      </Box>
                    </Typography>
                  ) : (
                    <LoadingButton
                      type="button"
                      variant="text"
                      size="small"
                      loading={isResending}
                      onClick={handleResendOtp}
                    >
                      Resend code
                    </LoadingButton>
                  )}
                </Box>
              </Stack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
});
export default LoginPage;
