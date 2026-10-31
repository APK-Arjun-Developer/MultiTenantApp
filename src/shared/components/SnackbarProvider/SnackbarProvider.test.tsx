import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { useSnackbar } from '@/shared/hooks/useSnackbar';

import SnackbarProvider from '.';

const Trigger = () => {
  const snackbar = useSnackbar();
  return (
    <>
      <button type="button" onClick={() => snackbar.warning('Careful')}>
        warning
      </button>
      <button type="button" onClick={() => snackbar.info('FYI', 50)}>
        info
      </button>
      <button type="button" onClick={() => snackbar.show('Plain')}>
        show
      </button>
    </>
  );
};

const renderProvider = () => {
  render(
    <SnackbarProvider>
      <Trigger />
    </SnackbarProvider>,
  );
  return userEvent.setup();
};

describe('SnackbarProvider', () => {
  it('shows a message with its severity and closes from the alert', async () => {
    const user = renderProvider();

    await user.click(screen.getByRole('button', { name: 'warning' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Careful');
    expect(alert.className).toContain('Warning');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('hides after a custom duration', async () => {
    const user = renderProvider();

    await user.click(screen.getByRole('button', { name: 'info' }));

    expect(await screen.findByText('FYI')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('FYI')).not.toBeInTheDocument());
  });

  it('defaults to info and stays open on a click-away', async () => {
    const user = renderProvider();

    await user.click(screen.getByRole('button', { name: 'show' }));
    expect((await screen.findByRole('alert')).className).toContain('Info');

    fireEvent.click(document.body);
    expect(screen.getByText('Plain')).toBeInTheDocument();
  });

  it('requires the provider', () => {
    const Orphan = () => {
      useSnackbar();
      return null;
    };

    expect(() => render(<Orphan />)).toThrow('useSnackbar must be used within SnackbarProvider');
  });
});
