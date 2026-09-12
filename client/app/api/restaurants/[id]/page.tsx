import Link from 'next/link';
import { getRestaurant, getSummary, getVisits } from '@/lib/apiClient';
import { AddVisitForm } from './AddVisitForm';
import { DeleteVisitButton } from './DeleteVisitButton';

type Params = { params: { id: string } };

export default async function RestaurantPage({ params }: Params) {
  const [restaurant, summary, visits] = await Promise.all([
    getRestaurant(params.id),
    getSummary(params.id),
    getVisits(params.id),
  ]);

  return (
    <div>
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        &larr; All restaurants
      </Link>

      <h2 className="mt-2 text-lg font-medium">{restaurant.name}</h2>
      <div className="mt-1 text-sm text-gray-600">
        {restaurant.cuisine} · {restaurant.address} · {restaurant.rating}★
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <div>
          <div className="text-gray-500">Visits</div>
          <div className="text-lg font-medium">{summary.visitCount}</div>
        </div>
        <div>
          <div className="text-gray-500">Total spent</div>
          <div className="text-lg font-medium">${summary.totalSpent.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">Last visit</div>
          <div className="text-lg font-medium">{summary.lastVisitedAt ?? '—'}</div>
        </div>
      </div>

      <h3 className="mt-8 mb-3 text-sm font-medium text-gray-700">Log a visit</h3>
      <AddVisitForm restaurantId={restaurant.id} />

      <h3 className="mt-8 mb-3 text-sm font-medium text-gray-700">Visit history</h3>
      <ul className="space-y-2">
        {visits.length === 0 && (
          <li className="text-sm text-gray-500">No visits logged yet.</li>
        )}
        {visits.map((visit) => (
          <li
            key={visit.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm"
          >
            <div>
              <span className="font-medium">{visit.date}</span>
              {visit.amountSpent !== null && (
                <span className="ml-2 text-gray-600">${visit.amountSpent.toFixed(2)}</span>
              )}
              {visit.notes && <div className="text-gray-500">{visit.notes}</div>}
            </div>
            <DeleteVisitButton visitId={visit.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}