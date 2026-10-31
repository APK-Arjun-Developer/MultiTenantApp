import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { isNetworkError, isUnreachable, NETWORK_ERROR_CODE } from './networkError';

const axiosErrorWithResponse = (status: number, data: unknown) =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse);

describe('isUnreachable', () => {
  it('is true when there is no response at all', () => {
    expect(isUnreachable(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(true);
  });

  it.each([502, 503, 504])('is true for a %i gateway error without an API envelope', (status) => {
    expect(isUnreachable(axiosErrorWithResponse(status, ''))).toBe(true);
  });

  it('is false for a gateway status that carries the API envelope', () => {
    const envelope = { data: null, message: 'Service down for maintenance' };
    expect(isUnreachable(axiosErrorWithResponse(503, envelope))).toBe(false);
  });

  it.each([400, 401, 404, 500])('is false for a regular %i API error', (status) => {
    expect(isUnreachable(axiosErrorWithResponse(status, ''))).toBe(false);
  });
});

describe('isNetworkError', () => {
  it('matches errors normalized with the network error code', () => {
    expect(isNetworkError({ status: 502, code: NETWORK_ERROR_CODE, message: 'x' })).toBe(true);
  });

  it.each([undefined, null, 'network_error', { code: 'unknown_error' }, { status: 0 }])(
    'does not match %j',
    (value) => {
      expect(isNetworkError(value)).toBe(false);
    },
  );
});
