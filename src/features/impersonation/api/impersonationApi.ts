import { apiSlice } from '@/shared/api/apiSlice';
import type {
  StartImpersonationRequest,
  StartImpersonationResponse,
  StopImpersonationResponse,
} from '@/types/api';

type StartImpersonationArgs = StartImpersonationRequest & {
  /** Explicit tenant ID to send as X-Tenant-Id. Required when selectedTenantId is not set in Redux (e.g. TenantAdminsPage). */
  tenantId?: string;
};

const impersonationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startImpersonation: builder.mutation<StartImpersonationResponse, StartImpersonationArgs>({
      query: ({ tenantId, ...body }) => ({
        url: '/api/v1/impersonation/start',
        method: 'POST',
        data: body,
        ...(tenantId ? { headers: { 'X-Tenant-Id': tenantId }, skipTenantHeader: true } : {}),
      }),
    }),
    stopImpersonation: builder.mutation<StopImpersonationResponse, void>({
      query: () => ({
        url: '/api/v1/impersonation/stop',
        method: 'POST',
      }),
    }),
  }),
});

const { useStartImpersonationMutation, useStopImpersonationMutation } = impersonationApi;

export { impersonationApi, useStartImpersonationMutation, useStopImpersonationMutation };
