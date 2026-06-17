import { apiSlice } from '@/shared/api/apiSlice';
import type { RoleDto, CreateRoleRequest, UpdateRoleRequest } from '@/types/api';

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<RoleDto[], void>({
      query: () => ({ url: '/api/v1/roles' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),
    getRole: builder.query<RoleDto, string>({
      query: (name) => ({ url: `/api/v1/roles/${encodeURIComponent(name)}` }),
      providesTags: (_, __, name) => [{ type: 'Role', id: name }],
    }),
    createRole: builder.mutation<RoleDto, CreateRoleRequest>({
      query: (body) => ({ url: '/api/v1/roles', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation<RoleDto, { name: string; body: UpdateRoleRequest }>({
      query: ({ name, body }) => ({
        url: `/api/v1/roles/${encodeURIComponent(name)}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (name) => ({
        url: `/api/v1/roles/${encodeURIComponent(name)}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
