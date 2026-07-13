import { apiSlice } from '@/shared/api/apiSlice';
import type { ActivityLogDto, ActivityLogQueryParams, PaginatedResponse } from '@/types/api';

export const activityLogsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query<
      PaginatedResponse<ActivityLogDto>,
      ActivityLogQueryParams | void
    >({
      query: (params) => ({
        url: '/api/v1/activity-logs',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          userId: params?.userId,
          module: params?.module,
          action: params?.action,
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: ['ActivityLog'],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogsApi;
