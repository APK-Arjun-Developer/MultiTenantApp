import { describe, expect, it } from 'vitest';

import { envelope, http, server } from '@/__tests__/msw/server';
import { paged } from '@/__tests__/utils/api';
import { setupStore } from '@/app/store';
import { activityLogsApi } from '@/features/activityLogs/api/activityLogsApi';
import { tenantAdminsApi } from '@/features/tenantAdmins/api/tenantAdminsApi';
import { tenantsApi } from '@/features/tenants/api/tenantsApi';
import { usersApi } from '@/features/users/api/usersApi';

/** Records the query string of every GET to `url`. */
const record = (url: string) => {
  const seen: URLSearchParams[] = [];
  server.use(
    http.get(url, ({ request }) => {
      seen.push(new URL(request.url).searchParams);
      return envelope(paged([]));
    }),
  );
  return seen;
};

describe('list endpoints called without parameters', () => {
  it.each([
    ['activity logs', '/api/v1/activity-logs', activityLogsApi.endpoints.getActivityLogs],
    ['tenant admins', '/api/v1/tenant-admins', tenantAdminsApi.endpoints.getTenantAdmins],
    [
      'tenant admin invitations',
      '/api/v1/tenant-admins/invitations',
      tenantAdminsApi.endpoints.getTenantAdminInvitations,
    ],
    [
      'tenant creation invitations',
      '/api/v1/tenants/invitations',
      tenantsApi.endpoints.getTenantCreationInvitations,
    ],
    ['users', '/api/v1/users', usersApi.endpoints.getUsers],
    ['user invitations', '/api/v1/users/invitations', usersApi.endpoints.getUserInvitations],
  ] as const)('request page 1 of 20 %s', async (_name, url, endpoint) => {
    const seen = record(url);
    const store = setupStore();

    await store.dispatch((endpoint.initiate as (arg?: undefined) => never)(undefined));

    expect(seen[0].get('page')).toBe('1');
    expect(seen[0].get('pageSize')).toBe('20');
  });
});
