import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { Mutex } from 'async-mutex';
import toast from 'react-hot-toast';
import { axiosInstance } from './axiosInstance';
import { logout } from '@/features/auth/slices/authSlice';
import type { ApiError, ApiResponse } from '@/types/api';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: unknown;
  headers?: AxiosRequestConfig['headers'];
  /** Skip injecting X-Tenant-Id — use for platform-level calls that must not be tenant-scoped. */
  skipTenantHeader?: boolean;
}

const mutex = new Mutex();

const rawBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> = async (
  { url, method = 'GET', data, params, headers, skipTenantHeader },
  api,
) => {
  const state = api.getState() as { ui: { selectedTenantId: string | null } };
  const selectedTenantId = !skipTenantHeader ? state.ui.selectedTenantId : null;

  const requestHeaders = {
    ...headers,
    ...(selectedTenantId ? { 'X-Tenant-Id': selectedTenantId } : {}),
  };

  try {
    const result = await axiosInstance.request<ApiResponse<unknown>>({
      url,
      method,
      data,
      params,
      headers: requestHeaders,
    });
    return { data: result.data?.data };
  } catch (err) {
    const error = err as AxiosError<ApiResponse<unknown>>;
    return {
      error: {
        status: error.response?.status ?? 0,
        code: error.response?.data?.errors?.code ?? 'unknown_error',
        message: error.response?.data?.message ?? error.message,
        details: error.response?.data?.errors?.details,
        traceId: error.response?.data?.traceId,
      },
    };
  }
};

export const baseQueryWithReauth: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const errorCode = result.error.code;

    // Inactive user or tenant — token refresh won't help; show message and sign out immediately.
    if (errorCode === 'user_inactive' || errorCode === 'tenant_inactive') {
      toast.error(result.error.message || 'Your account has been deactivated.');
      api.dispatch(logout());
      return result;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await rawBaseQuery(
          { url: '/api/v1/auth/refresh', method: 'POST', skipTenantHeader: true },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
