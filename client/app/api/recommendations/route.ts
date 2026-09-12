import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, ValidationError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';

function parseBudget(req: Request): number {
  const raw = new URL(req.url).searchParams.get('budget');
  if (raw === null) {
    throw new ValidationError('"budget" query parameter is required');
  }
  const budget = Number(raw);
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new ValidationError('"budget" must be a positive number');
  }
  return budget;
}

/**
 * GET /api/recommendations?budget=40
 * Suggests the highest-rated restaurant Brennen has visited, liked
 * (rating >= 4), and can afford again within the given budget.
 */
export async function GET(req: Request) {
  try {
    const budget = parseBudget(req);

    const { rows } = await pool.query(`
      SELECT
        r.id, r.name, r.cuisine, r.address, r.rating, r.created_at AS "createdAt",
        AVG(v."amountSpent") AS avg_spent
      FROM restaurants r
      JOIN visits v ON v."restaurantId" = r.id
      WHERE r.rating >= 4
      GROUP BY r.id, r.name, r.cuisine, r.address, r.rating, r.created_at
      ORDER BY r.rating DESC, avg_spent ASC
    `);

    if (rows.length === 0) {
      return NextResponse.json({
        restaurant: null,
        estimatedCost: null,
        reason: 'No liked restaurants yet - visit and rate a few first',
      });
    }

    const match = rows.find((row) => row.avg_spent !== null && Number(row.avg_spent) <= budget);

    if (!match) {
      return NextResponse.json({
        restaurant: null,
        estimatedCost: null,
        reason: `No liked restaurant fits within a $${budget} budget`,
      });
    }

    return NextResponse.json({
      restaurant: toRestaurant(match),
      estimatedCost: Math.round(Number(match.avg_spent) * 100) / 100,
      reason: 'Highest-rated liked restaurant within budget',
    });
  } catch (err) {
    return handleError(err);
  }
}