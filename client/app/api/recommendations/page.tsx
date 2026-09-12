'use client';

import { useState, type FormEvent } from 'react';
import type { Restaurant } from '@/lib/types';

interface RecommendationResult {
  restaurant: Restaurant | null;
  estimatedCost: number | null;
  reason: string;
}

export default function RecommendationsPage() {
  const [budget, setBudget] = useState('');
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch(`/api/recommendations?budget=${encodeURIComponent(budget)}`);
    const body = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(body.error ?? 'Something went wrong');
      return;
    }

    setResult(body);
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Where should I eat?</h2>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-4 text-sm"
      >
        <div>
          <label className="block text-gray-500">Budget ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-32 rounded border border-gray-300 px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-3 py-1.5 text-white disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Suggest a restaurant'}
        </button>
      </form>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {result && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
          {result.restaurant ? (
            <>
              <div className="text-lg font-medium">{result.restaurant.name}</div>
              <div className="mt-1 text-gray-600">
                {result.restaurant.cuisine} · {result.restaurant.address} · {result.restaurant.rating}★
              </div>
              <div className="mt-2 text-gray-500">
                Estimated cost: ${result.estimatedCost?.toFixed(2)}
              </div>
            </>
          ) : (
            <div className="text-gray-600">{result.reason}</div>
          )}
        </div>
      )}
    </div>
  );
}