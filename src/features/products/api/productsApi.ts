import { apiSlice } from '@/shared/api/apiSlice';
import type { ProductDto, CreateProductRequest, UpdateProductRequest } from '@/types/api';

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductDto[], void>({
      query: () => ({ url: '/api/v1/products' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    createProduct: builder.mutation<ProductDto, CreateProductRequest>({
      query: (body) => ({ url: '/api/v1/products', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<ProductDto, UpdateProductRequest>({
      query: (body) => ({ url: '/api/v1/products', method: 'PUT', data: body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (name) => ({
        url: `/api/v1/products/${encodeURIComponent(name)}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
