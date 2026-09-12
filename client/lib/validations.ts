import type { Restaurant, Visit } from '@/lib/types';
import { NotFoundError, ValidationError } from '@/lib/errors';

const MAX_POSTGRES_INT = 2147483647;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type RestaurantInput = Omit<Restaurant, 'id' | 'createdAt'>;
export type VisitInput = Omit<Visit, 'id' | 'restaurantId' | 'createdAt'>;

/** Parses a request body as JSON, turning a malformed body into a ValidationError. */
export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError('Request body must be valid JSON');
  }
}

/** Parses a route :id param; anything that isn't a valid positive Postgres integer means "no such resource". */
export function parseId(raw: string, resourceName: string): number {
  if (!/^\d+$/.test(raw)) {
    throw new NotFoundError(`${resourceName} not found`);
  }
  const id = Number(raw);
  if (id > MAX_POSTGRES_INT) {
    throw new NotFoundError(`${resourceName} not found`);
  }
  return id;
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

export function validateVisitInput(body: unknown): VisitInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Request body must be a JSON object');
  }
  const { date, amountSpent, notes } = body as Record<string, unknown>;

  if (typeof date !== 'string' || !DATE_ONLY_RE.test(date) || Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())) {
    throw new ValidationError('"date" is required and must be a valid "YYYY-MM-DD" date');
  }
  if (
    amountSpent !== undefined &&
    amountSpent !== null &&
    (typeof amountSpent !== 'number' || !Number.isFinite(amountSpent) || amountSpent < 0)
  ) {
    throw new ValidationError('"amountSpent" must be a non-negative number');
  }
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    throw new ValidationError('"notes" must be a string or null');
  }

  return {
    date,
    amountSpent: (amountSpent as number | null) ?? null,
    notes: (notes as string | null) ?? null,
  };
}