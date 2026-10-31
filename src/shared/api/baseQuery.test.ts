import toast from 'react-hot-toast';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { logout } from '@/features/auth/slices/authSlice';

import { axiosInstance } from './axiosInstance';
import { baseQueryWithReauth } from './baseQuery';
import { NETWORK_ERROR_CODE, NETWORK_ERROR_MESSAGE } from './networkError';

vi.mock('./axiosInstance', () => ({ axiosInstance: { request: vi.fn() } }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }));

const request = vi.mocked(axiosInstance.request);

const createApi = (selectedTenantId: string | null = null) =>
  ({
    dispatch: vi.fn(),
    getState: () => ({ ui: { selectedTenantId } }),
  }) as unknown as BaseQueryApi;

const ok = (data: unknown) => ({ data: { data } }) as AxiosResponse;

const fail = (status: number, data: unknown) =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse);

const envelope = (message: string, code: string) => ({ data: null, message, errors: { code } });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('baseQueryWithReauth', () => {
  it('unwraps data from the API envelope', async () => {
    request.mockResolvedValueOnce(ok({ id: 1 }));

    const result = await baseQueryWithReauth({ url: '/api/v1/items' }, createApi(), {});

    expect(result).toEqual({ data: { id: 1 } });
  });

  it('injects X-Tenant-Id from the selected tenant', async () => {
    request.mockResolvedValueOnce(ok(null));

    await baseQueryWithReauth({ url: '/api/v1/items' }, createApi('tenant-1'), {});

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ headers: { 'X-Tenant-Id': 'tenant-1' } }),
    );
  });

  it('omits X-Tenant-Id when skipTenantHeader is set', async () => {
    request.mockResolvedValueOnce(ok(null));

    await baseQueryWithReauth(
      { url: '/api/v1/auth/me', skipTenantHeader: true },
      createApi('tenant-1'),
      {},
    );

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ headers: {} }));
  });

  it('maps an unreachable server to a network error', async () => {
    request.mockRejectedValueOnce(fail(502, ''));

    const result = await baseQueryWithReauth({ url: '/api/v1/items' }, createApi(), {});

    expect(result.error).toEqual({
      status: 502,
      code: NETWORK_ERROR_CODE,
      message: NETWORK_ERROR_MESSAGE,
    });
  });

  it('maps API envelope errors', async () => {
    request.mockRejectedValueOnce(fail(400, envelope('Email is taken', 'validation_error')));

    const result = await baseQueryWithReauth({ url: '/api/v1/items' }, createApi(), {});

    expect(result.error).toMatchObject({
      status: 400,
      code: 'validation_error',
      message: 'Email is taken',
    });
  });

  it('refreshes the token on 401 and retries the original request', async () => {
    request
      .mockRejectedValueOnce(fail(401, envelope('Unauthorized', 'unauthorized')))
      .mockResolvedValueOnce(ok({ refreshed: true }))
      .mockResolvedValueOnce(ok({ id: 1 }));
    const api = createApi();

    const result = await baseQueryWithReauth({ url: '/api/v1/items' }, api, {});

    expect(request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ url: '/api/v1/auth/refresh', method: 'POST' }),
    );
    expect(result).toEqual({ data: { id: 1 } });
    expect(api.dispatch).not.toHaveBeenCalled();
  });

  it('logs out when the token refresh fails', async () => {
    request
      .mockRejectedValueOnce(fail(401, envelope('Unauthorized', 'unauthorized')))
      .mockRejectedValueOnce(fail(401, envelope('Invalid refresh token', 'unauthorized')));
    const api = createApi();

    await baseQueryWithReauth({ url: '/api/v1/items' }, api, {});

    expect(api.dispatch).toHaveBeenCalledWith(logout());
  });

  it('logs out without refreshing when the user is inactive', async () => {
    request.mockRejectedValueOnce(fail(401, envelope('Account deactivated', 'user_inactive')));
    const api = createApi();

    await baseQueryWithReauth({ url: '/api/v1/items' }, api, {});

    expect(request).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Account deactivated');
    expect(api.dispatch).toHaveBeenCalledWith(logout());
  });
});
