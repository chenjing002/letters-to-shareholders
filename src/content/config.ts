import { defineCollection, z } from 'astro:content';

const letters = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    year: z.number(),
    title: z.string(),
    source: z.string().optional(),
    date: z.string().optional(),
  }),
});

export const collections = { letters };
