import { apiSlice } from '@/shared/api/apiSlice';
import type {
  TenantConfigDto,
  TenantDto,
  UpdateCurrentTenantConfigRequest,
  UpdateTenantSettingsRequest,
} from '@/types/api';

const getTenantLogoUrl = (tenantId: string): string => {
  return `/api/v1/files/${tenantId}/download`;
};

const tenantSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenantSettings: builder.query<TenantDto, void>({
      query: () => ({ url: '/api/v1/tenant-settings' }),
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

    uploadTenantLogo: builder.mutation<TenantDto, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: '/api/v1/tenant-settings/logo', method: 'POST', data: form };
      },
      invalidatesTags: ['TenantSettings', 'Tenant'],
    }),

    removeTenantLogo: builder.mutation<TenantDto, void>({
      query: () => ({ url: '/api/v1/tenant-settings/logo', method: 'DELETE' }),
      invalidatesTags: ['TenantSettings', 'Tenant'],
    }),

    getTenantConfig: builder.query<TenantConfigDto, void>({
      query: () => ({ url: '/api/v1/tenant-settings/config' }),
      providesTags: ['TenantConfig'],
    }),

    updateTenantConfig: builder.mutation<TenantConfigDto, UpdateCurrentTenantConfigRequest>({
      query: (body) => ({
        url: '/api/v1/tenant-settings/config',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['TenantConfig'],
    }),
  }),
});

const {
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
  useUploadTenantLogoMutation,
  useRemoveTenantLogoMutation,
  useGetTenantConfigQuery,
  useUpdateTenantConfigMutation,
} = tenantSettingsApi;

export {
  getTenantLogoUrl,
  tenantSettingsApi,
  useGetTenantConfigQuery,
  useGetTenantSettingsQuery,
  useRemoveTenantLogoMutation,
  useUpdateTenantConfigMutation,
  useUpdateTenantSettingsMutation,
  useUploadTenantLogoMutation,
};
