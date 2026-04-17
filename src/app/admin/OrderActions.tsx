'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  orderId: string;
  format: 'digital' | 'physical';
  printfulOrderId?: string | null;
  printfulStatus?: string | null;
  printfulError?: string | null;
}

export default function OrderActions({ orderId, format, printfulOrderId, printfulStatus, printfulError }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  if (format !== 'physical') {
    return <span className="text-[11px] text-mid italic">Digital</span>;
  }

  if (printfulOrderId) {
    return (
      <div className="flex items-center gap-1.5 text-[11px]">
        <CheckCircle2 size={12} className="text-mint flex-shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-mint">PF#{printfulOrderId}</span>
          {printfulStatus && (
            <span className="text-mid">{printfulStatus}</span>
          )}
        </div>
      </div>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch('/api/printful/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, confirm: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setMsg('Draft created in Printful');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={submit}
        disabled={submitting}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark disabled:opacity-50"
      >
        {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        {submitting ? 'Submitting…' : 'Submit to Printful'}
      </button>
      {msg && <span className="text-[10px] text-mint">{msg}</span>}
      {(err || printfulError) && (
        <span className="text-[10px] text-coral inline-flex items-center gap-1 max-w-[150px]">
          <AlertTriangle size={10} /> {(err ?? printfulError)?.slice(0, 60)}
        </span>
      )}
    </div>
  );
}
