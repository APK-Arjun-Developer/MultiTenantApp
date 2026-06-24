import { apiSlice } from '@/shared/api/apiSlice';
import type { ReportSummaryDto, PlatformSummaryDto } from '@/types/api';

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReportSummary: builder.query<ReportSummaryDto, void>({
      query: () => ({ url: '/api/v1/reports/summary' }),
    }),

    getPlatformSummary: builder.query<PlatformSummaryDto, void>({
      query: () => ({ url: '/api/v1/reports/platform-summary', skipTenantHeader: true }),
    }),
  }),
});

export const { useGetReportSummaryQuery, useGetPlatformSummaryQuery } = reportsApi;
