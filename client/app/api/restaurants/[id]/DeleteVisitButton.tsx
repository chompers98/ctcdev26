'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteVisitButton({ visitId }: { visitId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/visits/${visitId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-400 hover:text-red-600 disabled:opacity-50"
    >
      {deleting ? '…' : 'Delete'}
    </button>
  );
}