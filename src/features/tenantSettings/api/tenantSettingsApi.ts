import { apiSlice } from '@/shared/api/apiSlice';
import type { TenantDto, UpdateTenantSettingsRequest } from '@/types/api';

export const tenantSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenantSettings: builder.query<TenantDto, void>({
      query: () => ({
        url: '/api/v1/tenant-settings',
      }),
      providesTags: ['TenantSettings'],
    }),

    updateTenantSettings: builder.mutation<TenantDto, UpdateTenantSettingsRequest>({
      query: (body) => ({
        url: '/api/v1/tenant-settings',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['TenantSettings', 'Tenant'],
    }),
  }),
});

export const { useGetTenantSettingsQuery, useUpdateTenantSettingsMutation } = tenantSettingsApi;
