import { describe, expect, it } from 'vitest';

import { envelope, http, server } from '@/__tests__/msw/server';
import { capture } from '@/__tests__/utils/api';
import { setupStore } from '@/app/store';

import { filesApi, getFileDownloadUrl } from './filesApi';

const file = { id: 'f1', fileName: 'a.pdf', contentType: 'application/pdf', size: 3 };

describe('filesApi', () => {
  it('lists and fetches files', async () => {
    server.use(
      http.get('/api/v1/files', () => envelope([file])),
      http.get('/api/v1/files/:id', ({ params }) => envelope({ ...file, id: params.id })),
    );
    const store = setupStore();

    const list = await store.dispatch(filesApi.endpoints.getFiles.initiate());
    const one = await store.dispatch(filesApi.endpoints.getFile.initiate('f2'));

    expect(list.data).toEqual([file]);
    expect(one.data).toMatchObject({ id: 'f2' });
  });

  it('uploads as multipart form data and deletes by id', async () => {
    const uploads = capture('post', '/api/v1/files', file);
    const deletes = capture('delete', '/api/v1/files/f1');
    const store = setupStore();

    const uploaded = await store.dispatch(
      filesApi.endpoints.uploadFile.initiate(new File(['abc'], 'a.pdf')),
    );
    await store.dispatch(filesApi.endpoints.deleteFile.initiate('f1'));

    expect(uploaded.data).toEqual(file);
    expect(uploads[0]).toEqual(expect.stringContaining('name="file"'));
    expect(deletes).toHaveLength(1);
  });

  it('builds the download URL from the API base URL', () => {
    expect(getFileDownloadUrl('f1')).toMatch(/\/api\/v1\/files\/f1\/download$/);
  });
});
