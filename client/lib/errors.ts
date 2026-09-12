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
export class ConflictError extends Error {}

/** True if err is a Postgres unique-violation error (code 23505). */
function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === '23505';
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
  if (err instanceof ConflictError || isUniqueViolation(err)) {
    const message = err instanceof ConflictError ? err.message : 'A restaurant with that name and address already exists';
    return NextResponse.json({ error: message }, { status: 409 });
  }

  console.error('Unhandled API error:', err);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}