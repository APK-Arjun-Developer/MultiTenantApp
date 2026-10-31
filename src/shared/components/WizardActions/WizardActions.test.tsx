import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import type { FormWizardActionsParams } from 'mui-schema-form-builder';
import { describe, expect, it, vi } from 'vitest';

import WizardActions from '.';

const renderActions = (overrides: Partial<FormWizardActionsParams> = {}) => {
  const params: FormWizardActionsParams = {
    isSubmitting: false,
    isNavigating: false,
    isFirstStep: true,
    isLastStep: false,
    activeStep: 0,
    next: vi.fn(),
    back: vi.fn(),
    submit: vi.fn(),
    cancel: vi.fn(),
    ...overrides,
  };
  const view = render(<WizardActions {...params} submitText="Create" />);
  return { ...view, params };
};

describe('WizardActions', () => {
  it('shows Cancel and Next on the first step', async () => {
    const { params } = renderActions();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(params.cancel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('hides Cancel on the first step when the wizard has no onCancel', () => {
    renderActions({ cancel: undefined });

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('shows Back instead of Cancel after the first step', async () => {
    const { params } = renderActions({ isFirstStep: false, activeStep: 1 });

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(params.back).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('calls next from the Next button', async () => {
    const { params } = renderActions();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(params.next).toHaveBeenCalledTimes(1);
  });

  it('renders a submit button with submitText on the last step', () => {
    renderActions({ isFirstStep: false, isLastStep: true, activeStep: 1 });

    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('type', 'submit');
  });

  it('disables navigation while the step is validating', () => {
    renderActions({ isNavigating: true });

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderActions();

    expect(await axe(container)).toHaveNoViolations();
  });
});
