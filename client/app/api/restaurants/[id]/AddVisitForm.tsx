'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function AddVisitForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/restaurants/${restaurantId}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        amountSpent: amountSpent === '' ? null : Number(amountSpent),
        notes: notes === '' ? null : notes,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Something went wrong');
      return;
    }

    setDate('');
    setAmountSpent('');
    setNotes('');
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-white p-4 text-sm"
    >
      <div>
        <label className="block text-gray-500">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-gray-500">Amount spent</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amountSpent}
          onChange={(e) => setAmountSpent(e.target.value)}
          className="w-28 rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <div className="flex-1">
        <label className="block text-gray-500">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-3 py-1.5 text-white disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Add visit'}
      </button>
      {error && <div className="w-full text-red-600">{error}</div>}
    </form>
  );
}