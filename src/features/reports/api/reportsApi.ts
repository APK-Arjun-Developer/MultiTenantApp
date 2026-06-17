import { apiSlice } from '@/shared/api/apiSlice';
import type { ReportsSummary } from '@/types/api';

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReportsSummary: builder.query<ReportsSummary, void>({
      query: () => ({ url: '/api/v1/reports/summary' }),
      providesTags: [{ type: 'Report', id: 'SUMMARY' }],
    }),
  }),
});

export const { useGetReportsSummaryQuery } = reportsApi;
