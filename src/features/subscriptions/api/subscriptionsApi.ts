import { apiSlice } from '@/shared/api/apiSlice';
import type { SubscriptionPlanDto, TenantPlanResponse, UpdateTenantPlanRequest } from '@/types/api';

const subscriptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlanDto[], void>({
      query: () => ({
        url: '/api/v1/subscriptions/plans',
        skipTenantHeader: true,
      }),
      providesTags: ['Subscription'],
    }),

    updateTenantPlan: builder.mutation<TenantPlanResponse, UpdateTenantPlanRequest>({
      query: (body) => ({
        url: '/api/v1/subscriptions/tenant-plan',
        method: 'PUT',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant', 'Subscription'],
    }),
  }),
});

const { useGetSubscriptionPlansQuery, useUpdateTenantPlanMutation } = subscriptionsApi;

export { subscriptionsApi, useGetSubscriptionPlansQuery, useUpdateTenantPlanMutation };
