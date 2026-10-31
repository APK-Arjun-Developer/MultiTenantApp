import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { capture } from '@/__tests__/utils/api';
import { field, fillFields, STRONG_PASSWORD, validAddressPayload } from '@/__tests__/utils/forms';
import { renderWithProviders, signedInState } from '@/__tests__/utils/renderWithProviders';
import { mockImageCanvas, uploadAndCrop } from '@/__tests__/utils/upload';
import type { RootState } from '@/app/store';
import type { TenantDto, UserDto } from '@/types/api';

import ProfilePage from './ProfilePage';

const CURRENT = '/api/v1/users/current';
const SETTINGS = '/api/v1/tenant-settings';

const me: UserDto = {
  id: 'u1',
  fullName: 'Jane Doe',
  email: 'jane@acme.com',
  tenantId: 't1',
  systemRole: 'TenantAdmin',
  isActive: true,
  roles: ['Admin'],
  profileFileId: null,
  address: { line1: '1 Main St', city: 'Springfield', postalCode: '12345', country: 'USA' },
  createdVia: 'Direct',
  hasPendingSetup: false,
};

const company: TenantDto = {
  id: 't1',
  name: 'Acme',
  isActive: true,
  createdVia: 'Direct',
  profileFileId: null,
  address: { line1: '9 Corp Way', city: 'Metropolis', postalCode: '99999', country: 'USA' },
};

const mockApi = ({ user = me, tenant = company } = {}) =>
  server.use(
    http.get(CURRENT, () => envelope(user)),
    http.get(SETTINGS, () => envelope(tenant)),
  );

const renderPage = (route = '/profile', preloadedState: Partial<RootState> = signedInState()) =>
  renderWithProviders(<ProfilePage />, { route, path: '/profile', preloadedState });

type User = ReturnType<typeof renderPage>['user'];

const companyLoaded = () => waitFor(() => expect(field('Company name')).toHaveValue('Acme'));

const removeViaModal = async (user: User) => {
  await user.click(await screen.findByRole('button', { name: 'Remove photo' }));
  const confirm = await screen.findByRole('dialog', { name: 'Remove photo' });
  await user.click(within(confirm).getByRole('button', { name: 'Remove' }));
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ProfilePage', () => {
  it('shows the signed-in user', async () => {
    mockApi();
    renderPage();

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getAllByText('jane@acme.com').length).toBeGreaterThan(0);
    expect(screen.getByText('TenantAdmin')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Company' })).toBeInTheDocument();
  });

  describe('profile tab', () => {
    it('updates the full name', async () => {
      mockApi();
      const bodies = capture('put', CURRENT, me);
      const { user } = renderPage();
      await screen.findByText('Jane Doe');

      await fillFields(user, { 'Full name': 'Jane Smith' });
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(await screen.findByText('Profile updated.')).toBeInTheDocument();
      expect(bodies).toEqual([{ fullName: 'Jane Smith' }]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.put(CURRENT, () => apiError(400, 'Name not allowed'), { once: true }));
      const { user } = renderPage();
      await screen.findByText('Jane Doe');

      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Name not allowed')).toBeInTheDocument();

      server.use(http.put(CURRENT, () => apiError(500, '')));
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Failed to update profile.')).toBeInTheDocument();
    });
  });

  describe('address tab', () => {
    it('saves the address with the current name', async () => {
      mockApi();
      const bodies = capture('put', CURRENT, me);
      const { user } = renderPage('/profile?tab=address');

      await user.click(await screen.findByRole('button', { name: 'Save address' }));

      expect(await screen.findByText('Address updated.')).toBeInTheDocument();
      expect(bodies).toEqual([
        { fullName: 'Jane Doe', address: { ...validAddressPayload, line1: '1 Main St' } },
      ]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.put(CURRENT, () => apiError(400, 'Bad postal code'), { once: true }));
      const { user } = renderPage('/profile?tab=address');

      await user.click(await screen.findByRole('button', { name: 'Save address' }));
      expect(await screen.findByText('Bad postal code')).toBeInTheDocument();

      server.use(http.put(CURRENT, () => apiError(500, '')));
      await user.click(screen.getByRole('button', { name: 'Save address' }));
      expect(await screen.findByText('Failed to update address.')).toBeInTheDocument();
    });
  });

  describe('security tab', () => {
    const fillPasswords = (user: User) =>
      fillFields(user, {
        'Current password': 'Old!Pass1',
        'New password': STRONG_PASSWORD,
        'Confirm new password': STRONG_PASSWORD,
      });

    it('changes the password', async () => {
      mockApi();
      const bodies = capture('post', `${CURRENT}/change-password`);
      const { user } = renderPage('/profile?tab=security');
      await screen.findByRole('button', { name: 'Change password' });

      await fillPasswords(user);
      await user.click(screen.getByRole('button', { name: 'Change password' }));

      expect(await screen.findByText('Password changed successfully.')).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          currentPassword: 'Old!Pass1',
          newPassword: STRONG_PASSWORD,
          confirmPassword: STRONG_PASSWORD,
        },
      ]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(
        http.post(`${CURRENT}/change-password`, () => apiError(400, 'Wrong current password'), {
          once: true,
        }),
      );
      const { user } = renderPage('/profile?tab=security');
      await screen.findByRole('button', { name: 'Change password' });
      await fillPasswords(user);

      await user.click(screen.getByRole('button', { name: 'Change password' }));
      expect(await screen.findByText('Wrong current password')).toBeInTheDocument();

      server.use(http.post(`${CURRENT}/change-password`, () => apiError(500, '')));
      await user.click(screen.getByRole('button', { name: 'Change password' }));
      expect(await screen.findByText('Failed to change password.')).toBeInTheDocument();
    });
  });

  describe('company tab (tenant admins)', () => {
    it('saves company name and address', async () => {
      mockApi();
      const bodies = capture('put', SETTINGS, company);
      const { user } = renderPage('/profile?tab=company');
      await companyLoaded();

      await fillFields(user, { 'Company name': 'Acme Corp' });
      await user.click(screen.getByRole('button', { name: 'Save company settings' }));

      expect(await screen.findByText('Company settings updated.')).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          name: 'Acme Corp',
          address: { ...company.address, line2: null, state: null },
        },
      ]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.put(SETTINGS, () => apiError(409, 'Name taken'), { once: true }));
      const { user } = renderPage('/profile?tab=company');
      await companyLoaded();

      await user.click(screen.getByRole('button', { name: 'Save company settings' }));
      expect(await screen.findByText('Name taken')).toBeInTheDocument();

      server.use(http.put(SETTINGS, () => apiError(500, '')));
      await user.click(screen.getByRole('button', { name: 'Save company settings' }));
      expect(await screen.findByText('Failed to update company settings.')).toBeInTheDocument();
    });

    it('uploads, and reports a failed upload of, the company logo', async () => {
      mockImageCanvas();
      mockApi();
      server.use(http.post(`${SETTINGS}/logo`, () => apiError(413, ''), { once: true }));
      const { user } = renderPage('/profile?tab=company');
      await companyLoaded();

      await user.click(screen.getByText('A'));
      await uploadAndCrop(user);
      expect(await screen.findByText('Failed to upload company logo.')).toBeInTheDocument();

      capture('post', `${SETTINGS}/logo`, { ...company, profileFileId: 'logo-1' });
      await uploadAndCrop(user);
      expect(await screen.findByText('Company logo updated.')).toBeInTheDocument();
    });

    it('removes, and reports a failed removal of, the company logo', async () => {
      mockApi({ tenant: { ...company, profileFileId: 'logo-1' } });
      server.use(http.delete(`${SETTINGS}/logo`, () => apiError(500, ''), { once: true }));
      const { user } = renderPage('/profile?tab=company');
      await screen.findByText('Company logo');

      await user.click(
        screen.getByText('Company logo').closest('div')?.previousElementSibling as HTMLElement,
      );
      await removeViaModal(user);
      expect(await screen.findByText('Failed to remove company logo.')).toBeInTheDocument();

      capture('delete', `${SETTINGS}/logo`, company);
      await removeViaModal(user);
      expect(await screen.findByText('Company logo removed.')).toBeInTheDocument();
    });

    it('has no company tab for other roles, and falls back to the profile tab', async () => {
      mockApi({ user: { ...me, systemRole: 'TenantUser' } });
      renderPage('/profile?tab=company');

      expect(await screen.findByRole('button', { name: 'Save changes' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Company' })).not.toBeInTheDocument();
    });
  });

  describe('profile photo', () => {
    it('uploads, and reports a failed upload of, the photo', async () => {
      mockImageCanvas();
      mockApi();
      server.use(http.post(`${CURRENT}/avatar`, () => apiError(413, ''), { once: true }));
      const { user } = renderPage();

      await user.click(await screen.findByText('JD'));
      await uploadAndCrop(user);
      expect(await screen.findByText('Failed to upload profile picture.')).toBeInTheDocument();

      capture('post', `${CURRENT}/avatar`, { ...me, profileFileId: 'f1' });
      await uploadAndCrop(user);
      expect(await screen.findByText('Profile picture updated.')).toBeInTheDocument();
    });

    it('removes, and reports a failed removal of, the photo', async () => {
      mockApi({ user: { ...me, profileFileId: 'f1' } });
      server.use(http.delete(`${CURRENT}/avatar`, () => apiError(500, ''), { once: true }));
      const { user } = renderPage();
      await screen.findByText('Jane Doe');

      await user.click(screen.getAllByRole('img')[0]);
      await removeViaModal(user);
      expect(await screen.findByText('Failed to remove profile picture.')).toBeInTheDocument();

      capture('delete', `${CURRENT}/avatar`, me);
      await removeViaModal(user);
      expect(await screen.findByText('Profile picture removed.')).toBeInTheDocument();
    });
  });

  describe('sign out', () => {
    it('signs out after confirmation and returns to login', async () => {
      mockApi();
      capture('post', '/api/v1/auth/logout');
      const { user, store } = renderPage();
      await screen.findByText('Jane Doe');

      await user.click(screen.getByRole('button', { name: 'Sign out' }));
      const dialog = await screen.findByRole('dialog', { name: 'Sign out?' });
      await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));

      expect(await screen.findByTestId('location')).toHaveTextContent('/login');
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });

    it('is hidden while impersonating', async () => {
      mockApi();
      const { auth } = signedInState() as Pick<RootState, 'auth'>;
      renderPage('/profile', {
        auth: { ...auth, isImpersonating: true, impersonatedBy: null },
      });

      await screen.findByText('Jane Doe');
      expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
    });

    it('can be cancelled', async () => {
      mockApi();
      const { user } = renderPage();
      await screen.findByText('Jane Doe');

      await user.click(screen.getByRole('button', { name: 'Sign out' }));
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });
});
