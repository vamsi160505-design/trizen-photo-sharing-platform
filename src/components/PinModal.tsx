'use client';

import React, { useState } from 'react';
import { KeyRound, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface PinModalProps {
  gallerySlug: string;
  onSuccess: (sessionToken: string) => void;
}

export default function PinModal({ gallerySlug, onSuccess }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Please enter a valid PIN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/gallery/${gallerySlug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Incorrect PIN');
      }

      onSuccess(data.sessionToken);
    } catch (err: any) {
      setError(err.message || 'Incorrect gallery PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Protected Gallery
        </h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          This photo gallery is PIN-protected. Please enter the 6-digit access PIN provided by your event organizer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative max-w-xs mx-auto">
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (e.g. 482917)"
                className="w-full text-center tracking-widest text-2xl font-mono py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                autoFocus
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs flex items-center justify-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying PIN...</span>
              </>
            ) : (
              <span>Unlock & Access Gallery</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          Demo Gallery Access PIN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">482917</span>
        </div>
      </div>
    </div>
  );
}
