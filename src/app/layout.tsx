import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Photo Sharing Platform - TrizenAI Challenge',
  description: 'Collaborative photo-sharing and PIN-protected event gallery publishing platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-height-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-6 text-center">
          <p>© 2026 TrizenAI Technologies Private Limited. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
