import { apiSlice } from '@/shared/api/apiSlice';
import type { PaginatedResponse, TenantDto } from '@/types/api';

export const tenantsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query<PaginatedResponse<TenantDto>, void>({
      query: () => ({
        url: '/api/v1/tenants',
        params: { page: 1, pageSize: 200 },
        skipTenantHeader: true,
      }),
      providesTags: ['Tenant'],
    }),
  }),
});

export const { useGetTenantsQuery } = tenantsApi;
