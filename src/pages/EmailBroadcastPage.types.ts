import { FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { z } from 'zod';

const composeSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Max 200 characters'),
  htmlBody: z.string().min(1, 'Body is required'),
});

type ComposeValues = z.infer<typeof composeSchema>;

const composeFields: FieldConfig[] = [
  {
    name: 'subject',
    label: 'Subject',
    type: FIELD_TYPE.TEXT,
    required: true,
    muiProps: { placeholder: 'e.g. Happy holidays from our team!' },
  },
  {
    name: 'htmlBody',
    label: 'Email body (HTML supported)',
    type: FIELD_TYPE.TEXTAREA,
    required: true,
    muiProps: { rows: 10, placeholder: '<p>Dear user,</p>\n<p>...</p>' },
  },
];

export { composeFields, composeSchema, type ComposeValues };
