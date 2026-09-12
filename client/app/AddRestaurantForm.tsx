'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function AddRestaurantForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        cuisine: cuisine === '' ? null : cuisine,
        address: address === '' ? null : address,
        rating: rating === '' ? null : Number(rating),
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Something went wrong');
      return;
    }

    setName('');
    setCuisine('');
    setAddress('');
    setRating('');
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-white p-4 text-sm"
    >
      <div>
        <label className="block text-gray-500">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-gray-500">Cuisine</label>
        <input
          type="text"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <div className="flex-1">
        <label className="block text-gray-500">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-gray-500">Rating</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-20 rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-3 py-1.5 text-white disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Add restaurant'}
      </button>
      {error && <div className="w-full text-red-600">{error}</div>}
    </form>
  );
}