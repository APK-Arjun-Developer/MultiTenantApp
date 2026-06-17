import { apiSlice } from '@/shared/api/apiSlice';
import type { PermissionDto } from '@/types/api';

export const permissionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<PermissionDto[], void>({
      query: () => ({ url: '/api/v1/permissions' }),
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
  }),
});

export const { useGetPermissionsQuery } = permissionsApi;
