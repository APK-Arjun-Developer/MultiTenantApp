import { screen } from '@testing-library/react';
import { delay } from 'msw';

import { envelope, http, server } from '../msw/server';

/** A one-page PaginatedResponse. */
const paged = <T>(items: T[], totalCount = items.length) => ({
  items,
  page: 1,
  pageSize: 10,
  totalCount,
  totalPages: 1,
});

const parseBody = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // e.g. multipart uploads
  }
};

/**
 * Records the body of every request to `method url` (parsed JSON, raw text for non-JSON,
 * null when empty), answering with `response` in the API envelope.
 */
const capture = (method: 'post' | 'put' | 'delete', url: string, response: unknown = null) => {
  const bodies: unknown[] = [];
  server.use(
    http[method](url, async ({ request }) => {
      bodies.push(parseBody(await request.text()));
      return envelope(response as never);
    }),
  );
  return bodies;
};

/** Keeps every `method url` request pending, so a test can inspect the UI mid-save. */
const hold = (method: 'post' | 'put' | 'delete', url: string) =>
  server.use(http[method](url, () => delay('infinite')));

/** The table row containing `text` (waits for it to appear). */
const findRow = async (text: string) =>
  (await screen.findByText(text)).closest('tr') as HTMLElement;

export { capture, findRow, hold, paged };
