import type { FormWizardActionsParams } from 'mui-schema-form-builder';

interface WizardActionsProps extends FormWizardActionsParams {
  submitText: string;
  submitting?: boolean;
}

export { type WizardActionsProps };
