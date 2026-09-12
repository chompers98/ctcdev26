import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, NotFoundError } from '@/lib/errors';
import { parseId } from '@/lib/validations';

type Params = { params: { id: string } };

/**
 * DELETE /api/visits/:id
 * Removes a logged visit.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = parseId(params.id, 'Visit');
    const { rows } = await pool.query('DELETE FROM visits WHERE id = $1 RETURNING id', [id]);

    if (rows.length === 0) {
      throw new NotFoundError('Visit not found');
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}