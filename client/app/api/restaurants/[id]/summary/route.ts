import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, NotFoundError, parseId } from '@/lib/errors';
import { dateOnly } from '@/lib/types';

type Params = { params: { id: string } };

/**
 * GET /api/restaurants/:id/summary
 * Visit count and spending totals for a restaurant.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const restaurantId = parseId(params.id, 'Restaurant');

    const { rows: restaurantRows } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [restaurantId]);
    if (restaurantRows.length === 0) {
      throw new NotFoundError('Restaurant not found');
    }

    const { rows } = await pool.query(
      `SELECT
         COUNT(*) AS visit_count,
         COALESCE(SUM("amountSpent"), 0) AS total_spent,
         AVG("amountSpent") AS average_spent,
         MAX(date) AS last_visited_at
       FROM visits
       WHERE "restaurantId" = $1`,
      [restaurantId]
    );

    const row = rows[0];
    return NextResponse.json({
      visitCount: Number(row.visit_count),
      totalSpent: Number(row.total_spent),
      averageSpent: row.average_spent === null ? null : Number(row.average_spent),
      lastVisitedAt: row.last_visited_at === null ? null : dateOnly(row.last_visited_at),
    });
  } catch (err) {
    return handleError(err);
  }
}