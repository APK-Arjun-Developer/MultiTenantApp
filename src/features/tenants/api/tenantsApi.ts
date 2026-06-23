import { apiSlice } from '@/shared/api/apiSlice';
import type {
  PaginatedResponse,
  TenantDto,
  OnboardTenantRequest,
  OnboardTenantResponse,
  UpdateTenantRequest,
  DeleteTenantRequest,
} from '@/types/api';

export interface GetTenantsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const tenantsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query<PaginatedResponse<TenantDto>, GetTenantsParams | void>({
      query: (params) => ({
        url: '/api/v1/tenants',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 200,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
        skipTenantHeader: true,
      }),
      providesTags: ['Tenant'],
    }),

    onboardTenant: builder.mutation<OnboardTenantResponse, OnboardTenantRequest>({
      query: (body) => ({
        url: '/api/v1/tenants',
        method: 'POST',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant'],
    }),

    updateTenant: builder.mutation<TenantDto, UpdateTenantRequest>({
      query: (body) => ({
        url: '/api/v1/tenants',
        method: 'PUT',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant'],
    }),

    deleteTenant: builder.mutation<void, DeleteTenantRequest>({
      query: (body) => ({
        url: '/api/v1/tenants',
        method: 'DELETE',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant'],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useOnboardTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} = tenantsApi;
