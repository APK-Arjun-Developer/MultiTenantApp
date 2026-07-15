import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export type Step = 'login' | 'verify';

export interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}
