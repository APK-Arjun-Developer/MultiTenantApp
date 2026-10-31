import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import LoadingButton from '.';

describe('LoadingButton', () => {
  it('renders an enabled button with its label', () => {
    render(<LoadingButton>Save</LoadingButton>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('keeps its accessible name and reports busy while loading', () => {
    render(<LoadingButton loading>Save</LoadingButton>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('has no accessibility violations while loading', async () => {
    const { container } = render(<LoadingButton loading>Save</LoadingButton>);

    expect(await axe(container)).toHaveNoViolations();
  });
});
