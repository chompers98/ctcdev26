import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Feeding Brennen',
  description: 'Track restaurants, visits, and spending.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
            <Link href="/">
              <h1 className="text-xl font-semibold">Feeding Brennen</h1>
            </Link>            
            <nav className="text-sm">
              <Link href="/recommendations" className="text-gray-600 hover:underline">
                Where should I eat?
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
