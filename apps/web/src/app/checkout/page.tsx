'use client';

import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCheckout = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: 'Chain of Command Pro Se Filing Kit', amount: 0 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      } else {
        setStatus('success');
        setMessage(data.message || 'BotID verification successful!');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setStatus('error');
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111214] text-[#e1e2e5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1a1b1e] border border-[#2a2b30] rounded-xl p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-xl font-bold font-mono text-amber-400">BotID Protection Test</h1>
        </div>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          This endpoint demonstrates client-side BotID header synthesis connected with proxy rewrites via{' '}
          <code className="text-xs bg-[#24262c] text-amber-300 px-1.5 py-0.5 rounded">withBotId()</code> and server-side{' '}
          <code className="text-xs bg-[#24262c] text-amber-300 px-1.5 py-0.5 rounded">checkBotId()</code> verification.
        </p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Verifying with BotID...' : 'Test Protected API Route'}
        </button>
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              status === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-800 text-rose-300'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
