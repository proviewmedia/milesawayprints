'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Loader2, PackageCheck, Send } from 'lucide-react';
import { STATUS_OPTIONS } from '../types';

interface Props {
  orderId: string;
  status: string;
  trackingNumber: string | null;
  printfulOrderId: string | null;
  printfulError: string | null;
  isMarathon: boolean;
  hasPhysicalNonMarathon: boolean;
}

export default function OrderEditPanel({
  orderId,
  status: initialStatus,
  trackingNumber: initialTracking,
  printfulOrderId: initialPrintful,
  printfulError,
  isMarathon,
  hasPhysicalNonMarathon,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState(initialTracking ?? '');
  const [pfId, setPfId] = useState(initialPrintful ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const dirty =
    status !== initialStatus ||
    tracking !== (initialTracking ?? '') ||
    pfId !== (initialPrintful ?? '');

  const save = async () => {
    setSaving(true);
    setErr(null);
    setOk(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          tracking_number: tracking.trim() || null,
          printful_order_id: pfId.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setOk(true);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const markDelivered = async () => {
    setSaving(true);
    setErr(null);
    setOk(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mark delivered failed');
      setStatus('delivered');
      setOk(true);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Mark delivered failed');
    } finally {
      setSaving(false);
    }
  };

  const submitToPrintful = async () => {
    setSubmitting(true);
    setSubmitMsg(null);
    setErr(null);
    try {
      const res = await fetch('/api/printful/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, confirm: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setSubmitMsg('Draft created in Printful — review and confirm there');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canMarkDelivered =
    (initialStatus === 'shipped' || initialStatus === 'fulfilled') &&
    status !== 'delivered';

  return (
    <section className="bg-paper border border-border rounded-2xl p-5 space-y-5">
      <h2 className="text-[11px] font-medium tracking-widest uppercase text-mid">
        Manage
      </h2>

      {canMarkDelivered && (
        <button
          onClick={markDelivered}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-mint-light text-mint py-2.5 rounded-full text-sm font-medium hover:bg-mint hover:text-paper transition-colors disabled:opacity-50"
        >
          <PackageCheck size={14} /> Mark as delivered
        </button>
      )}

      <div>
        <label className="block text-[12px] font-medium text-ink mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
          {!STATUS_OPTIONS.includes(status as (typeof STATUS_OPTIONS)[number]) && (
            <option value={status}>{status}</option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-ink mb-1.5">
          Printful order ID
        </label>
        <input
          type="text"
          value={pfId}
          onChange={(e) => setPfId(e.target.value)}
          placeholder={isMarathon ? 'Paste after manual submission' : 'Auto-filled on submit'}
          className="input-field"
        />
        {isMarathon && !initialPrintful && (
          <p className="text-[11px] text-mid mt-1.5">
            Marathon orders are submitted to Printful by hand. Paste the resulting
            order ID here so the customer sees in_production status.
          </p>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-ink mb-1.5">
          Tracking number
        </label>
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Auto-set when Printful ships, or paste here"
          className="input-field"
        />
      </div>

      {(err || printfulError) && (
        <div className="flex items-start gap-2 text-xs text-coral bg-coral-light/40 rounded-lg p-3">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="break-all">{err ?? printfulError}</span>
        </div>
      )}
      {ok && (
        <div className="flex items-center gap-2 text-xs text-mint">
          <CheckCircle2 size={14} /> Saved
        </div>
      )}

      <button
        onClick={save}
        disabled={!dirty || saving}
        className="w-full bg-ink text-paper py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>

      {/* Submit-to-Printful for non-marathon physical orders that weren't
          auto-submitted (rare — usually webhook does it, but this is a
          manual escape hatch). */}
      {hasPhysicalNonMarathon && !initialPrintful && (
        <div className="pt-4 border-t border-border">
          <button
            onClick={submitToPrintful}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-soft text-ink py-2.5 rounded-full text-sm font-medium hover:bg-border transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send size={14} /> Submit to Printful (draft)
              </>
            )}
          </button>
          {submitMsg && (
            <p className="text-[11px] text-mint mt-2 text-center">{submitMsg}</p>
          )}
        </div>
      )}
    </section>
  );
}
