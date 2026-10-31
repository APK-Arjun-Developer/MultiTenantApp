import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSnackbar } from '@/shared/hooks/useSnackbar';

import AppProviders from './providers';

const SnackbarButton = () => {
  const snackbar = useSnackbar();
  return (
    <button type="button" onClick={() => snackbar.info('Hello from the app store')}>
      notify
    </button>
  );
};

describe('AppProviders', () => {
  it('provides the store, theme and snackbars to the app', () => {
    render(
      <AppProviders>
        <SnackbarButton />
      </AppProviders>,
    );

    screen.getByRole('button', { name: 'notify' }).click();

    return expect(screen.findByText('Hello from the app store')).resolves.toBeInTheDocument();
  });
});
