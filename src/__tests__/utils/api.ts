import { screen } from '@testing-library/react';

import { envelope, http, server } from '../msw/server';

/** A one-page PaginatedResponse. */
const paged = <T>(items: T[], totalCount = items.length) => ({
  items,
  page: 1,
  pageSize: 10,
  totalCount,
  totalPages: 1,
});

/**
 * Records the parsed JSON body (or null when empty) of every request to `method url`,
 * answering with `response` in the API envelope.
 */
const capture = (method: 'post' | 'put' | 'delete', url: string, response: unknown = null) => {
  const bodies: unknown[] = [];
  server.use(
    http[method](url, async ({ request }) => {
      const text = await request.text();
      bodies.push(text ? JSON.parse(text) : null);
      return envelope(response as never);
    }),
  );
  return bodies;
};

/** The table row containing `text` (waits for it to appear). */
const findRow = async (text: string) =>
  (await screen.findByText(text)).closest('tr') as HTMLElement;

export { capture, findRow, paged };
