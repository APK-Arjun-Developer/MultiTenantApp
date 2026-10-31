import { describe, expect, it } from 'vitest';

import {
  formatAddress,
  formatCurrency,
  formatDate,
  formatDateTime,
  getInitials,
  statusToIsActive,
} from './format';

describe('format utils', () => {
  it('formats dates, with a dash for missing values', () => {
    expect(formatDate('2026-10-01T10:00:00')).toBe('Oct 1, 2026');
    expect(formatDate('2026-10-01', 'YYYY/MM/DD')).toBe('2026/10/01');
    expect(formatDateTime('2026-10-01T15:30:00')).toBe('Oct 1, 2026 3:30 PM');
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });

  it('formats currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatCurrency(10, 'EUR')).toBe('€10.00');
  });

  it('joins the non-empty address parts', () => {
    expect(
      formatAddress({ line1: '1 Main St', line2: null, city: 'Springfield', country: 'USA' }),
    ).toBe('1 Main St, Springfield, USA');
    expect(formatAddress({ line1: '', city: null })).toBe('—');
    expect(formatAddress(null)).toBe('—');
  });

  it('maps status filters to isActive', () => {
    expect(statusToIsActive('active')).toBe(true);
    expect(statusToIsActive('inactive')).toBe(false);
    expect(statusToIsActive('')).toBeUndefined();
  });

  it('builds up to two initials', () => {
    expect(getInitials('jane mary doe')).toBe('JM');
    expect(getInitials('Cher')).toBe('C');
    expect(getInitials('   ')).toBe('?');
    expect(getInitials(null)).toBe('?');
  });
});
