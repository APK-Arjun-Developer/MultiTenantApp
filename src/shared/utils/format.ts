import dayjs from 'dayjs';

export function formatDate(value: string | null | undefined, pattern = 'MMM D, YYYY'): string {
  if (!value) return '—';
  return dayjs(value).format(pattern);
}

export function formatDateTime(value: string | null | undefined): string {
  return formatDate(value, 'MMM D, YYYY h:mm A');
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}
