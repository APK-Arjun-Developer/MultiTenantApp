import { afterEach, describe, expect, it, vi } from 'vitest';

import { exportToCsv } from './exportCsv';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Captures the CSV text and file name that exportToCsv downloads. */
const captureDownload = () => {
  const blobs: Blob[] = [];
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn((blob: Blob) => {
      blobs.push(blob);
      return 'blob:csv';
    }),
    revokeObjectURL: vi.fn(),
  });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  return { blobs, click };
};

describe('exportToCsv', () => {
  it('downloads rows as CSV with a header row', async () => {
    const { blobs, click } = captureDownload();

    exportToCsv('users', [
      { Name: 'Jane', Email: 'jane@acme.com' },
      { Name: 'Bob', Email: 'bob@acme.com' },
    ]);

    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.contexts[0]).toMatchObject({ download: 'users.csv' });
    expect(await blobs[0].text()).toBe('Name,Email\nJane,jane@acme.com\nBob,bob@acme.com');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:csv');
  });

  it('quotes values with commas, quotes or newlines and blanks out null', async () => {
    const { blobs } = captureDownload();

    exportToCsv('x', [{ A: 'a,b', B: 'say "hi"', C: 'line1\nline2', D: null, E: 3 }]);

    expect(await blobs[0].text()).toBe('A,B,C,D,E\n"a,b","say ""hi""","line1\nline2",,3');
  });

  it('does nothing for no rows', () => {
    const { click } = captureDownload();

    exportToCsv('empty', []);

    expect(click).not.toHaveBeenCalled();
  });
});
