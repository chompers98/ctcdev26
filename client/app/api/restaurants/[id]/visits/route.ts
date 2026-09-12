import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, NotFoundError } from '@/lib/errors';
import { VISIT_COLUMNS, toVisit } from '@/lib/types';
import { parseJsonBody, parseId, validateVisitInput } from '@/lib/validations';

type Params = { params: { id: string } };

async function assertRestaurantExists(id: number): Promise<void> {
  const { rows } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [id]);
  if (rows.length === 0) {
    throw new NotFoundError('Restaurant not found');
  }
}

/**
 * GET /api/restaurants/:id/visits
 * Lists a restaurant's visits, most recent first.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const restaurantId = parseId(params.id, 'Restaurant');
    await assertRestaurantExists(restaurantId);

    const { rows } = await pool.query(
      `SELECT ${VISIT_COLUMNS} FROM visits WHERE "restaurantId" = $1 ORDER BY date DESC`,
      [restaurantId]
    );

    return NextResponse.json(rows.map(toVisit));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/restaurants/:id/visits
 * Logs a new visit for a restaurant.
 */
export async function POST(req: Request, { params }: Params) {
  try {
    const restaurantId = parseId(params.id, 'Restaurant');
    await assertRestaurantExists(restaurantId);

    const body = await parseJsonBody(req);
    const { date, amountSpent, notes } = validateVisitInput(body);

    const { rows } = await pool.query(
      `INSERT INTO visits ("restaurantId", date, "amountSpent", notes)
       VALUES ($1, $2, $3, $4)
       RETURNING ${VISIT_COLUMNS}`,
      [restaurantId, date, amountSpent, notes]
    );

    return NextResponse.json(toVisit(rows[0]), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}