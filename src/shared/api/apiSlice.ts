import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Tenant',
    'TenantAdmin',
    'Role',
    'Product',
    'Report',
    'Permission',
    'Invitation',
    'File',
    'ActivityLog',
    'Subscription',
    'TenantSettings',
  ],
  endpoints: () => ({}),
});

export { apiSlice };
