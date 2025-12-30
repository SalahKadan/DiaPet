import { z } from 'zod';
import { insertPetSchema, insertFoodSchema, pets, foods, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  pets: {
    get: {
      method: 'GET' as const,
      path: '/api/pets',
      responses: {
        200: z.array(z.custom<typeof pets.$inferSelect>()),
        401: errorSchemas.internal, // Not logged in
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pets',
      input: insertPetSchema,
      responses: {
        201: z.custom<typeof pets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    action: {
      method: 'POST' as const,
      path: '/api/pets/:id/action',
      input: z.object({
        type: z.enum(['feed', 'insulin', 'sleep', 'wake', 'play']),
        foodId: z.number().optional(),
        insulinUnits: z.number().optional(),
      }),
      responses: {
        200: z.custom<typeof pets.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    updateBloodSugar: {
      method: 'POST' as const,
      path: '/api/pets/:id/blood-sugar',
      input: z.object({
        value: z.number(), // New reading
      }),
      responses: {
        200: z.custom<typeof pets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  foods: {
    list: {
      method: 'GET' as const,
      path: '/api/foods',
      responses: {
        200: z.array(z.custom<typeof foods.$inferSelect>()),
      },
    },
  },
  chat: {
    message: {
      method: 'POST' as const,
      path: '/api/chat',
      input: z.object({
        message: z.string(),
        petId: z.number(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
