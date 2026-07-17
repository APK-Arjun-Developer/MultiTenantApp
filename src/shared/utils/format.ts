import dayjs from 'dayjs';

const formatDate = (value: string | null | undefined, pattern = 'MMM D, YYYY'): string => {
  if (!value) return '—';
  return dayjs(value).format(pattern);
};

const formatDateTime = (value: string | null | undefined): string => {
  return formatDate(value, 'MMM D, YYYY h:mm A');
};

const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
};

const formatAddress = (
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null,
): string => {
  if (!address) return '—';
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

export { formatAddress, formatCurrency, formatDate, formatDateTime };
