import { apiSlice } from '@/shared/api/apiSlice';
import type {
  PaginatedResponse,
  RoleDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  PermissionCatalogResponse,
} from '@/types/api';

export interface GetRolesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  permissionIds?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<PaginatedResponse<RoleDto>, GetRolesParams | void>({
      query: (params) => ({
        url: '/api/v1/roles',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 100,
          search: params?.search,
          permissionIds: params?.permissionIds,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: ['Role'],
    }),

    createRole: builder.mutation<RoleDto, CreateRoleRequest>({
      query: (body) => ({
        url: '/api/v1/roles',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Role'],
    }),

    updateRole: builder.mutation<RoleDto, UpdateRoleRequest>({
      query: (body) => ({
        url: '/api/v1/roles',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Role'],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (name) => ({
        url: `/api/v1/roles/${encodeURIComponent(name)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    getPermissions: builder.query<PermissionCatalogResponse, void>({
      query: () => ({
        url: '/api/v1/permissions',
        // Custom roles are capped at the TenantUser ceiling for every caller
        // (including SystemAdmin), so only show assignable permissions.
        params: { grouped: true, scope: 'TenantUser' },
      }),
      providesTags: ['Permission'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
} = rolesApi;
