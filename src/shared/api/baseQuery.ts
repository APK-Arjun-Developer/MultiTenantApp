import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { Mutex } from 'async-mutex';
import { axiosInstance } from './axiosInstance';
import { logout, setTokens } from '@/features/auth/slices/authSlice';
import type { RootState } from '@/app/store';
import type { ApiError, ApiResponse, RefreshTokenResponse } from '@/types/api';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: unknown;
  headers?: AxiosRequestConfig['headers'];
}

const mutex = new Mutex();

const rawBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> = async (
  { url, method = 'GET', data, params, headers },
  { getState },
) => {
  try {
    const accessToken = (getState() as RootState).auth.accessToken;
    const result = await axiosInstance.request<ApiResponse<unknown>>({
      url,
      method,
      data,
      params,
      headers: {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
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
        const refreshToken = (api.getState() as RootState).auth.refreshToken;
        if (!refreshToken) {
          api.dispatch(logout());
          return result;
        }

        const refreshResult = await rawBaseQuery(
          { url: '/api/v1/auth/refresh', method: 'POST', data: { refreshToken } },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const { accessToken, refreshToken: newRefreshToken } =
            refreshResult.data as RefreshTokenResponse;
          api.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));
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
