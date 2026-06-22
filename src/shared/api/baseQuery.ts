import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { Mutex } from 'async-mutex';
import { axiosInstance } from './axiosInstance';
import { logout } from '@/features/auth/slices/authSlice';
import type { ApiError, ApiResponse } from '@/types/api';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: unknown;
  headers?: AxiosRequestConfig['headers'];
}

const mutex = new Mutex();

const rawBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> = async ({
  url,
  method = 'GET',
  data,
  params,
  headers,
}) => {
  try {
    const result = await axiosInstance.request<ApiResponse<unknown>>({
      url,
      method,
      data,
      params,
      headers,
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
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // No body needed — the refresh token cookie is sent automatically via withCredentials
        const refreshResult = await rawBaseQuery(
          { url: '/api/v1/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          // Server has already set the new access + refresh cookies; retry the original request
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
