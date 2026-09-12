import { NextResponse } from 'next/server';

/**
 * Central error -> HTTP response mapper for the API route handlers. Call it
 * from a route's `catch` block so error handling lives in one place:
 *
 *   try {
 *     ...
 *   } catch (err) {
 *     return handleError(err);
 *   }
 *
 * This is a STUB. Right now it always returns a generic 500. A real
 * implementation would inspect the error (validation vs. not-found vs.
 * conflict vs. unexpected) and choose an appropriate status code and shape.
 *
 * This is task A3. The write endpoints from A2 can't return sensible 400s and
 * 404s while every failure funnels into a 500.
 *
 * TODO (A3): map known error types to proper status codes (400, 404, 409, ...)
 * TODO (A3): avoid leaking internal error details in responses
 */

export class ValidationError extends Error {}
export class NotFoundError extends Error {}

/** Parses a request body as JSON, turning a malformed body into a ValidationError. */
export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError('Request body must be valid JSON');
  }
}

/**
 * Central error -> HTTP response mapper for the API route handlers. Call it
 * from a route's `catch` block so error handling lives in one place.
 */
export function handleError(err: unknown): NextResponse {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }

  console.error('Unhandled API error:', err);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}