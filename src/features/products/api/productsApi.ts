import { apiSlice } from '@/shared/api/apiSlice';
import type {
  PaginatedResponse,
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/api';

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<ProductDto>, GetProductsParams | void>({
      query: (params) => ({
        url: '/api/v1/products',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: ['Product'],
    }),

    createProduct: builder.mutation<ProductDto, CreateProductRequest>({
      query: (body) => ({
        url: '/api/v1/products',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation<ProductDto, UpdateProductRequest>({
      query: (body) => ({
        url: '/api/v1/products',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (name) => ({
        url: `/api/v1/products/${encodeURIComponent(name)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
