import { apiSlice } from '@/shared/api/apiSlice';
import type { DashboardStatsDto } from '@/types/api';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsDto, void>({
      query: () => ({
        url: '/api/v1/dashboard/stats',
      }),
      // Stats derive from users/tenants/admins — reuse their tags so any
      // mutation that invalidates them also refreshes the dashboard counts.
      providesTags: ['User', 'Tenant', 'TenantAdmin'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
