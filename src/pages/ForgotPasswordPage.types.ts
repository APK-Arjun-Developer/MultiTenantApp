import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export { forgotPasswordSchema, type ForgotPasswordFormValues };
