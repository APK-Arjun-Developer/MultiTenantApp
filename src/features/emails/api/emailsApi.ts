import { apiSlice } from '@/shared/api/apiSlice';
import type { EmailBroadcastResponse, SendEmailBroadcastRequest } from '@/types/api';

const emailsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendEmailBroadcast: builder.mutation<EmailBroadcastResponse, SendEmailBroadcastRequest>({
      query: (body) => ({
        url: '/api/v1/emails/broadcast',
        method: 'POST',
        data: body,
      }),
    }),
  }),
});

const { useSendEmailBroadcastMutation } = emailsApi;

export { emailsApi, useSendEmailBroadcastMutation };
