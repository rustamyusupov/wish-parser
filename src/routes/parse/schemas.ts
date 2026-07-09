import { z } from 'zod';

export const parseBody = z.object({
  url: z.url(),
});

export const parseResult = z.discriminatedUnion('available', [
  z.object({
    available: z.literal(true),
    amount: z.number(),
    currencyCode: z.string(),
    name: z.string().optional(),
  }),
  z.object({
    available: z.literal(false),
  }),
]);

export const parseError = z.object({
  message: z.string(),
});
