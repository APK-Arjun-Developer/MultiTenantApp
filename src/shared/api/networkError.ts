import type { AxiosError } from 'axios';

const NETWORK_ERROR_CODE = 'network_error';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Please try again in a moment.';

const GATEWAY_STATUSES = new Set([502, 503, 504]);

const isUnreachable = (error: AxiosError): boolean => {
  if (!error.response) return true;
  const hasEnvelope = typeof error.response.data === 'object' && error.response.data !== null;
  return GATEWAY_STATUSES.has(error.response.status) && !hasEnvelope;
};

const isNetworkError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === NETWORK_ERROR_CODE;

export { isNetworkError, isUnreachable, NETWORK_ERROR_CODE, NETWORK_ERROR_MESSAGE };
