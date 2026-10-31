import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server, unreachable } from '@/__tests__/msw/server';
import {
  fillFields,
  STRONG_PASSWORD,
  validAddress,
  validAddressPayload,
} from '@/__tests__/utils/forms';
import { renderWithProviders } from '@/__tests__/utils/renderWithProviders';

import InvitationPage from './InvitationPage';

const VALIDATE = '/api/v1/invitations/validate';
const ACCEPT_ADMIN = '/api/v1/invitations/accept/tenant-admin';
const ACCEPT_USER = '/api/v1/invitations/accept/user';
const ACCEPT_NEW_TENANT = '/api/v1/invitations/accept/new-tenant';

const acceptResponse = (roles: string[]) => ({
  userId: 'u1',
  email: 'jane@acme.com',
  fullName: 'Jane Doe',
  tenantId: 't1',
  roles,
  invitationType: 'TenantUser',
  isActive: true,
});

const renderPage = (route = '/invitation/accept?token=abc') =>
  renderWithProviders(<InvitationPage />, { route, path: '/invitation/accept' });

const validate = (data: Record<string, unknown>) =>
  server.use(
    http.get(VALIDATE, () => envelope({ isValid: true, email: 'jane@acme.com', ...data })),
  );

const capture = (url: string, roles: string[] = []) => {
  const calls: unknown[] = [];
  server.use(
    http.post(url, async ({ request }) => {
      calls.push(await request.json());
      return envelope(acceptResponse(roles));
    }),
  );
  return calls;
};

const profile = {
  'Full name': 'Jane Doe',
  Password: STRONG_PASSWORD,
  'Confirm password': STRONG_PASSWORD,
};

const acceptPayload = {
  token: 'abc',
  fullName: 'Jane Doe',
  password: STRONG_PASSWORD,
  confirmPassword: STRONG_PASSWORD,
  address: validAddressPayload,
};

describe('InvitationPage', () => {
  it('rejects a link without a token', () => {
    renderPage('/invitation/accept');

    expect(screen.getByText('No invitation token found in the link.')).toBeInTheDocument();
  });

  it('shows the server reason, or a default, for an invalid invitation', async () => {
    server.use(http.get(VALIDATE, () => envelope({ isValid: false })));
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Invitation expired or invalid' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Please contact your administrator/)).toBeInTheDocument();
  });

  it('shows Server unavailable when the API is down', async () => {
    server.use(http.get(VALIDATE, unreachable));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Server unavailable' })).toBeInTheDocument();
  });

  it('accepts a tenant admin invitation', async () => {
    validate({ invitationType: 'TenantAdmin', tenantName: 'Acme' });
    const calls = capture(ACCEPT_ADMIN, ['Admin', 'Support']);
    const { user } = renderPage();

    expect(await screen.findByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    await fillFields(user, profile);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await fillFields(user, validAddress);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('heading', { name: 'Account created!' })).toBeInTheDocument();
    expect(screen.getByText('Admin, Support')).toBeInTheDocument();
    expect(calls).toEqual([acceptPayload]);
  });

  it('accepts a tenant user invitation (numeric type) through the user endpoint', async () => {
    validate({ invitationType: 2, tenantName: 'Acme' });
    const calls = capture(ACCEPT_USER);
    const { user } = renderPage();

    expect(await screen.findByText('User')).toBeInTheDocument();
    await fillFields(user, profile);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await fillFields(user, validAddress);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('heading', { name: 'Account created!' })).toBeInTheDocument();
    expect(calls).toEqual([acceptPayload]);
  });

  it('shows the API error, or a fallback message, when accepting fails', async () => {
    validate({ invitationType: 'TenantUser', tenantName: 'Acme' });
    server.use(
      http.post(ACCEPT_USER, () => apiError(409, 'Email already registered'), { once: true }),
    );
    const { user } = renderPage();
    await screen.findByText('Acme');
    await fillFields(user, profile);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await fillFields(user, validAddress);

    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByText('Email already registered')).toBeInTheDocument();

    server.use(http.post(ACCEPT_USER, () => apiError(500, '')));
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(
      await screen.findByText('Failed to accept invitation. The link may have expired.'),
    ).toBeInTheDocument();
  });

  describe('new tenant invitation', () => {
    const fillNewTenant = async (user: ReturnType<typeof renderPage>['user']) => {
      await screen.findByText('Create your tenant account');
      await fillFields(user, profile);
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await fillFields(user, { 'Company / tenant name': 'NewCo', ...validAddress });
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await fillFields(user, validAddress);
      await user.click(screen.getByRole('button', { name: 'Create tenant & account' }));
    };

    it('creates the tenant with its address and the owner account', async () => {
      validate({ invitationType: 'NewTenant' });
      const calls = capture(ACCEPT_NEW_TENANT);
      const { user } = renderPage();

      await fillNewTenant(user);

      expect(await screen.findByRole('heading', { name: 'Account created!' })).toBeInTheDocument();
      expect(calls).toEqual([
        {
          token: 'abc',
          fullName: 'Jane Doe',
          password: STRONG_PASSWORD,
          confirmPassword: STRONG_PASSWORD,
          tenantName: 'NewCo',
          tenantAddress: validAddressPayload,
          userAddress: validAddressPayload,
        },
      ]);
    });

    it('shows the API error when creating the tenant fails', async () => {
      validate({ invitationType: 3 });
      server.use(http.post(ACCEPT_NEW_TENANT, () => apiError(409, 'Tenant name taken')));
      const { user } = renderPage();

      await fillNewTenant(user);

      expect(await screen.findByText('Tenant name taken')).toBeInTheDocument();
    });
  });
});
