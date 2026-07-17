import { apiSlice } from '@/shared/api/apiSlice';
import type { FileDto } from '@/types/api';

const filesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query<FileDto[], void>({
      query: () => ({ url: '/api/v1/files' }),
      providesTags: ['File'],
    }),

    getFile: builder.query<FileDto, string>({
      query: (id) => ({ url: `/api/v1/files/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'File', id }],
    }),

    uploadFile: builder.mutation<FileDto, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/api/v1/files',
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        };
      },
      invalidatesTags: ['File'],
    }),

    deleteFile: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/files/${id}`, method: 'DELETE' }),
      invalidatesTags: ['File'],
    }),
  }),
});

const { useGetFilesQuery, useGetFileQuery, useUploadFileMutation, useDeleteFileMutation } =
  filesApi;

const getFileDownloadUrl = (id: string): string => {
  return `${import.meta.env.VITE_API_BASE_URL}/api/v1/files/${id}/download`;
};

export {
  filesApi,
  getFileDownloadUrl,
  useDeleteFileMutation,
  useGetFileQuery,
  useGetFilesQuery,
  useUploadFileMutation,
};
