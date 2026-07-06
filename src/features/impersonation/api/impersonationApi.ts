import { apiSlice } from '@/shared/api/apiSlice';
import type {
  StartImpersonationRequest,
  StartImpersonationResponse,
  StopImpersonationResponse,
} from '@/types/api';

export const impersonationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startImpersonation: builder.mutation<StartImpersonationResponse, StartImpersonationRequest>({
      query: (body) => ({
        url: '/api/v1/impersonation/start',
        method: 'POST',
        data: body,
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

export const { useStartImpersonationMutation, useStopImpersonationMutation } = impersonationApi;
