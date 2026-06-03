'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Trophy } from 'lucide-react';
import {
  type AdminOrder,
  STATUS_STYLE,
  hasMarathonItem,
  needsMarathonAction,
} from './types';

type Filter = 'all' | 'needs_action' | 'marathon' | 'paid' | 'shipped';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'needs_action', label: 'Needs action' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
];

interface Props {
  orders: AdminOrder[];
  initialFilter?: Filter;
  hideFilters?: boolean;
  emptyLabel?: string;
}

export default function OrdersTable({
  orders,
  initialFilter = 'all',
  hideFilters = false,
  emptyLabel = 'No orders match this filter.',
}: Props) {
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'needs_action') return orders.filter(needsMarathonAction);
    if (filter === 'marathon') return orders.filter(hasMarathonItem);
    if (filter === 'paid') return orders.filter((o) => o.status === 'paid' || o.status === 'approved');
    if (filter === 'shipped') return orders.filter((o) => o.status === 'shipped' || o.status === 'fulfilled');
    return orders;
  }, [orders, filter]);

  return (
    <div className="space-y-4">
      {!hideFilters && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`relative px-3 py-2 text-sm whitespace-nowrap transition-opacity ${
                filter === f.value ? 'text-ink' : 'text-mid hover:text-ink'
              }`}
            >
              {f.label}
              {filter === f.value && (
                <span className="absolute left-3 right-3 -bottom-[1px] h-px bg-ink" />
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-mid">
            {filtered.length} of {orders.length}
          </span>
        </div>
      )}

      <div className="bg-paper border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-mid">{emptyLabel}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-soft text-[10px] font-medium tracking-wider uppercase text-mid">
                <tr>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const isMarathon = hasMarathonItem(o);
                  const needsAction = needsMarathonAction(o);
                  const itemSummary = summarizeItems(o);
                  return (
                    <tr
                      key={o.id}
                      className="border-t border-border hover:bg-soft/60 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${o.token}`}
                          className="font-medium text-ink hover:underline"
                        >
                          #{o.order_number}
                        </Link>
                        {needsAction && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-coral mt-1">
                            <AlertTriangle size={10} /> Needs action
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-ink">{o.customer_name ?? '—'}</div>
                        <div className="text-xs text-mid truncate max-w-[220px]">
                          {o.customer_email ?? ''}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isMarathon && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warm bg-warm-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <Trophy size={10} /> Marathon
                            </span>
                          )}
                          <span className="text-ink">{itemSummary}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            STATUS_STYLE[o.status] ?? 'bg-soft text-mid'
                          }`}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-ink font-medium">
                        ${(o.price_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-mid">
                        {new Date(o.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function summarizeItems(o: AdminOrder): string {
  const cart = o.cart_snapshot ?? [];
  if (cart.length === 0) {
    return `${o.print_type_slug ?? '—'}${o.size ? ` · ${o.size}` : ''}`;
  }
  if (cart.length === 1) {
    const it = cart[0];
    return `${it.name}${it.size ? ` · ${it.size}` : ''}`;
  }
  return `${cart.length} items`;
}
