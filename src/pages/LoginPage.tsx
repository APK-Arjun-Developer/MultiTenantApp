import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import {
  FormBuilder,
  FIELD_TYPE,
  type FieldConfig,
  type FormBuilderHandle,
} from 'mui-schema-form-builder';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';
import {
  useLoginMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from '@/features/auth/api/authApi';
import { PASSWORD_FIELD } from '@/shared/components/PasswordField';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';

// ─── Schemas & field config ──────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantSlug: z.string().optional(),
});
type LoginValues = z.infer<typeof loginSchema>;

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
    type: PASSWORD_FIELD,
    required: true,
    muiProps: { autoComplete: 'current-password' },
  },
  {
    name: 'tenantSlug',
    label: 'Tenant slug',
    type: FIELD_TYPE.TEXT,
    muiProps: { autoComplete: 'off' },
  },
];

// ─── OTP Input ───────────────────────────────────────────────────────────────

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH);

  const update = (nextDigits: string[]) => onChange(nextDigits.join('').trimEnd());

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = digit;
    update(next);
    if (digit && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    update(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
            style: { textAlign: 'center', fontSize: 22, fontWeight: 700, padding: 0 },
          }}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e as React.KeyboardEvent<HTMLInputElement>)}
          onPaste={handlePaste}
          sx={{
            width: 48,
            height: 56,
            border: '2px solid',
            borderColor: digit ? 'primary.main' : 'divider',
            borderRadius: 1.5,
            transition: 'border-color 0.15s',
            '&.Mui-focused': { borderColor: 'primary.main' },
          }}
        />
      ))}
    </Box>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Step = 'login' | 'verify';

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

export function LoginPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyEmailMutation, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationMutation, { isLoading: isResending }] = useResendVerificationMutation();

  const loginRef = useRef<FormBuilderHandle>(null);
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const slugFromUrl = searchParams.get('slug') ?? searchParams.get('tenant') ?? '';

  const [step, setStep] = useState<Step>('login');
  const [direction, setDirection] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingTenantSlug, setPendingTenantSlug] = useState<string | undefined>();
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (slugFromUrl) loginRef.current?.reset();
  }, [slugFromUrl]);

  const goToVerify = (email: string, tenantSlug?: string) => {
    setDirection(1);
    setPendingEmail(email);
    setPendingTenantSlug(tenantSlug);
    setOtp('');
    setStep('verify');
  };

  const goToLogin = () => {
    setDirection(-1);
    setStep('login');
    setOtp('');
  };

  const sendOtp = async (email: string, tenantSlug?: string, silent = false) => {
    try {
      await resendVerificationMutation({ email, tenantSlug }).unwrap();
      setCooldown(60);
      if (!silent) snackbar.success('A new code has been sent to your email.');
    } catch {
      // server always returns 200 for this endpoint — failure is infra-level
    }
  };

  const onLoginSubmit = async (values: LoginValues) => {
    try {
      await loginMutation({
        email: values.email,
        password: values.password,
        tenantSlug: values.tenantSlug || undefined,
      }).unwrap();
    } catch (err) {
      const error = err as ApiError;
      if (error.status === 400 && error.message?.includes('not been verified')) {
        goToVerify(values.email, values.tenantSlug || undefined);
        await sendOtp(values.email, values.tenantSlug || undefined, true);
      } else {
        snackbar.error(
          error.message || 'Invalid credentials. Please check your email and password.',
        );
      }
    }
  };

  const onVerifySubmit = async () => {
    if (otp.length !== OTP_LENGTH) return;
    try {
      await verifyEmailMutation({
        email: pendingEmail,
        tenantSlug: pendingTenantSlug,
        otp,
      }).unwrap();
      snackbar.success('Email verified! You can now sign in.');
      goToLogin();
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Invalid or expired verification code.');
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <Box sx={{ overflow: 'hidden' }}>
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
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Sign in to your account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your credentials to continue
            </Typography>

            <FormBuilder
              ref={loginRef}
              schema={loginSchema}
              fields={loginFields}
              onSubmit={onLoginSubmit}
              submitText={isLoggingIn ? 'Signing in…' : 'Sign in'}
              sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
            />

            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Typography
                component={Link}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
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
              <IconButton onClick={goToLogin} size="small" sx={{ mb: 1, ml: -0.5 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <MarkEmailReadIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Verify your email
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We sent a 6-digit code to{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {pendingEmail}
                </Box>
                . Enter it below to confirm your address.
              </Typography>

              <Stack spacing={3}>
                <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={otp.length !== OTP_LENGTH || isVerifying}
                  onClick={onVerifySubmit}
                  startIcon={
                    isVerifying ? <CircularProgress size={16} color="inherit" /> : undefined
                  }
                >
                  {isVerifying ? 'Verifying…' : 'Verify email'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  {cooldown > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Resend code in{' '}
                      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {cooldown}s
                      </Box>
                    </Typography>
                  ) : (
                    <Button
                      variant="text"
                      size="small"
                      disabled={isResending}
                      onClick={() => sendOtp(pendingEmail, pendingTenantSlug)}
                      startIcon={
                        isResending ? <CircularProgress size={14} color="inherit" /> : undefined
                      }
                    >
                      {isResending ? 'Sending…' : 'Resend code'}
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
