import { afterEach, describe, expect, it, vi } from 'vitest';

import { storage } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('storage', () => {
  it('reads and writes strings and JSON', () => {
    storage.set('a', 'x');
    storage.setJson('b', { n: 1 });

    expect(storage.getString('a')).toBe('x');
    expect(storage.getJson('b')).toEqual({ n: 1 });

    storage.remove('a');
    expect(storage.getString('a')).toBeNull();
  });

  it('returns null for missing or corrupt JSON', () => {
    localStorage.setItem('bad', '{not json');

    expect(storage.getJson('missing')).toBeNull();
    expect(storage.getJson('bad')).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    const blocked = () => {
      throw new Error('SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked);

    expect(storage.getString('a')).toBeNull();
    expect(storage.getJson('a')).toBeNull();
    expect(() => storage.set('a', 'x')).not.toThrow();
    expect(() => storage.setJson('a', 1)).not.toThrow();
    expect(() => storage.remove('a')).not.toThrow();
  });
});
