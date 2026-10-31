import { http, HttpResponse, type JsonBodyType } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

/** Wraps data in the API envelope that baseQuery unwraps. */
const envelope = (data: JsonBodyType, init?: ResponseInit) =>
  HttpResponse.json({ data, message: null }, init);

/** API error in envelope form (what the server returns on 4xx/5xx). */
const apiError = (status: number, message: string, code = 'error') =>
  HttpResponse.json({ data: null, message, errors: { code } }, { status });

/** The API process is down: what the Vite proxy returns. */
const unreachable = () => new HttpResponse(null, { status: 502 });

export { apiError, envelope, http, server, unreachable };
