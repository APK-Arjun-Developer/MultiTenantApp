import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const apiSlice = createApi({
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
  ],
  endpoints: () => ({}),
});
