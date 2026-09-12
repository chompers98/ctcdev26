import type { Restaurant } from '@/lib/types';
import { ValidationError } from '@/lib/errors';

export type RestaurantInput = Omit<Restaurant, 'id' | 'createdAt'>;

/** Parses a request body as JSON, turning a malformed body into a ValidationError. */
export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError('Request body must be valid JSON');
  }
}

export function validateRestaurantInput(body: unknown) : RestaurantInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Request body must be a JSON object');
  }
  const { name, cuisine, address, rating } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('"name" is required and must be a non-empty string');
  }
  if (cuisine !== undefined && cuisine !== null && typeof cuisine !== 'string') {
    throw new ValidationError('"cuisine" must be a string or null');
  }
  if (address !== undefined && address !== null && typeof address !== 'string') {
    throw new ValidationError('"address" must be a string or null');
  }
  if (
    rating !== undefined &&
    rating !== null &&
    (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 0 || rating > 5)
  ) {
    throw new ValidationError('"rating" must be a number between 0 and 5');
  }

  return {
    name: name.trim(),
    cuisine: (cuisine as string | null) ?? null,
    address: (address as string | null) ?? null,
    rating: (rating as number | null) ?? null,
  };
}