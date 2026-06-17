import { apiSlice } from '@/shared/api/apiSlice';
import type {
  TenantDto,
  OnboardTenantRequest,
  UpdateTenantRequest,
  DeleteTenantRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api';

export const tenantsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query<PaginatedResponse<TenantDto>, PaginationParams>({
      query: (params) => ({ url: '/api/v1/tenants', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Tenant' as const, id })),
              { type: 'Tenant', id: 'LIST' },
            ]
          : [{ type: 'Tenant', id: 'LIST' }],
    }),
    getTenant: builder.query<TenantDto, string>({
      query: (slug) => ({ url: `/api/v1/tenants/${slug}` }),
      providesTags: (_, __, slug) => [{ type: 'Tenant', id: slug }],
    }),
    onboardTenant: builder.mutation<TenantDto, OnboardTenantRequest>({
      query: (body) => ({ url: '/api/v1/tenants/onboard', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Tenant', id: 'LIST' }],
    }),
    updateTenant: builder.mutation<TenantDto, UpdateTenantRequest>({
      query: (body) => ({ url: '/api/v1/tenants', method: 'PUT', data: body }),
      invalidatesTags: [{ type: 'Tenant', id: 'LIST' }],
    }),
    deleteTenant: builder.mutation<void, DeleteTenantRequest>({
      query: (body) => ({ url: '/api/v1/tenants', method: 'DELETE', data: body }),
      invalidatesTags: [{ type: 'Tenant', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantQuery,
  useOnboardTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} = tenantsApi;
