'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Loader,
  Wallet,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { createPayment, getPaymentGroup } from '@/service/order';
import { ORDER_STATUS_META } from '@/constants/orderStatus';
import { Orders } from './Order';

interface Props {
  order: Orders;
}

export const PaymentDrawer = ({ order }: Props) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'Cash' | 'Online'>('Cash');
  const [received, setReceived] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    kind: 'error' | 'success';
    message: string;
  } | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSuccessTimer() {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
  }

  function showError(message: string) {
    clearSuccessTimer();
    setAlert({ kind: 'error', message });
  }

  function showSuccess(message: string) {
    setAlert({ kind: 'success', message });
    clearSuccessTimer();
    successTimer.current = setTimeout(() => setAlert(null), 4000);
  }

  useEffect(() => clearSuccessTimer, []);

  const {
    data: group,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/payment-group', order.id],
    queryFn: () => getPaymentGroup(order.id),
    enabled: open,
  });

  const unpaidItems = useMemo(() => {
    const map = new Map<string, { price: number; quantity: number }>();
    group?.orders.forEach((o) =>
      o.items.forEach((it) => {
        if (!it.paid) map.set(it.id, { price: it.price, quantity: it.quantity });
      })
    );
    return map;
  }, [group]);

  const total = useMemo(() => {
    let t = 0;
    selected.forEach((id) => {
      const it = unpaidItems.get(id);
      if (it) t += it.price * it.quantity;
    });
    return Math.round(t * 100) / 100;
  }, [selected, unpaidItems]);

  const change =
    mode === 'Cash' && received !== ''
      ? Math.round((Number(received) - total) * 100) / 100
      : null;

  function toggleItem(id: string) {
    setAlert((a) => (a?.kind === 'error' ? null : a));
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleOrder(ids: string[], allSelected: boolean) {
    setAlert((a) => (a?.kind === 'error' ? null : a));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  const sortedOrders = useMemo(
    () =>
      [...(group?.orders ?? [])].sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return ta - tb;
      }),
    [group]
  );

  const allUnpaidIds = useMemo(
    () => Array.from(unpaidItems.keys()),
    [unpaidItems]
  );
  const allSelectedGlobally =
    allUnpaidIds.length > 0 && allUnpaidIds.every((id) => selected.has(id));

  function toggleAll() {
    setAlert((a) => (a?.kind === 'error' ? null : a));
    setSelected(allSelectedGlobally ? new Set() : new Set(allUnpaidIds));
  }

  async function handlePay() {
    if (selected.size === 0) return showError('Seleciona itens para pagar');
    if (mode === 'Cash' && (received === '' || Number(received) < total)) {
      const missing = Math.round((total - Number(received || 0)) * 100) / 100;
      return showError(
        `Dinheiro recebido insuficiente — faltam ${missing.toFixed(2)}€`
      );
    }
    setSaving(true);
    try {
      const res = await createPayment({
        order_item_ids: Array.from(selected).filter((id) => unpaidItems.has(id)),
        mode,
        received: mode === 'Cash' ? Number(received) : undefined,
      });
      showSuccess(
        res.change != null
          ? `Pagamento registado · Troco: ${res.change}€`
          : 'Pagamento registado'
      );
      setSelected(new Set());
      setReceived('');
      await refetch();
    } catch {
      showError('Não foi possível registar o pagamento');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      direction="bottom"
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setSelected(new Set());
          setMode('Cash');
          setReceived('');
          clearSuccessTimer();
          setAlert(null);
        }
      }}
    >
      <DrawerTrigger asChild>
        <button
          title="Pagar"
          className="jato-flame inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-flame/25 transition-transform hover:scale-[1.02]"
        >
          <Wallet className="h-4 w-4" />
          Pagar
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-6xl flex-col overflow-y-auto px-4 pb-8">
          {/* drag handle */}
          <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-charcoal/15" />

          <DrawerHeader className="px-0">
            <div className="flex items-start justify-between gap-3">
              <div className="text-left">
                <DrawerTitle className="font-display text-lg text-charcoal">
                  Pagamento
                </DrawerTitle>
                {group?.phone_number && (
                  <p className="mt-0.5 text-sm text-charcoal/50">
                    Cliente · {group.phone_number}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-charcoal/45">
                  Em dívida
                </p>
                <p className="font-display text-xl font-bold text-flame">
                  {(group?.outstanding_total ?? 0).toFixed(2)}€
                </p>
              </div>
            </div>
            <DrawerDescription className="sr-only">
              Selecione os itens a pagar
            </DrawerDescription>
          </DrawerHeader>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <Loader className="h-6 w-6 animate-spin text-flame" />
            </div>
          ) : group && group.orders.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <Wallet className="h-8 w-8 text-status-paid" />
              <p className="mt-3 font-display font-semibold text-charcoal">
                Tudo pago
              </p>
              <p className="text-sm text-charcoal/50">
                Não há itens por pagar deste cliente.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex-1 gap-4 lg:grid lg:grid-cols-[1fr_18rem] lg:items-stretch">
              <div className="space-y-3">
              {/* select-all bar */}
              <div className="flex items-center justify-between px-1 text-xs">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="font-semibold text-flame"
                >
                  {allSelectedGlobally ? 'Limpar seleção' : 'Selecionar tudo'}
                </button>
                <span className="text-charcoal/45">
                  {selected.size} de {allUnpaidIds.length}{' '}
                  {allUnpaidIds.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {/* orders grid — flows into columns on wider screens */}
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sortedOrders.map((o) => {
                const unpaid = o.items.filter((it) => !it.paid);
                const ids = unpaid.map((it) => it.id);
                const allSelected =
                  ids.length > 0 && ids.every((id) => selected.has(id));
                const orderMeta = ORDER_STATUS_META[o.status];
                const orderOutstanding = unpaid.reduce(
                  (s, it) => s + it.price * it.quantity,
                  0
                );
                const createdAt = o.created_at
                  ? new Date(o.created_at)
                  : null;
                const createdLabel =
                  createdAt && !isNaN(createdAt.getTime())
                    ? format(createdAt, "d 'de' MMM · HH:mm", { locale: pt })
                    : null;
                return (
                  <div
                    key={o.id}
                    className="overflow-hidden rounded-xl border border-charcoal/10"
                  >
                    {/* header: #n · mesa · estado · (hora) — subtotal à direita */}
                    <div className="flex items-center justify-between gap-2 border-b border-charcoal/5 bg-charcoal/[0.02] px-3 py-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-display text-sm font-bold text-charcoal">
                          #{o.order_number}
                        </span>
                        <span className="text-xs text-charcoal/45">
                          Mesa {o.table}
                        </span>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            orderMeta.soft
                          )}
                        >
                          {orderMeta.label}
                        </span>
                        {createdLabel && (
                          <span className="text-[11px] text-charcoal/40">
                            · {createdLabel}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 font-display text-sm font-bold text-charcoal">
                        {orderOutstanding.toFixed(2)}€
                      </span>
                    </div>

                    <div className="divide-y divide-charcoal/5 px-3">
                      {o.items.map((it) => (
                        <label
                          key={it.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-2.5 py-1.5 text-sm',
                            it.paid && 'cursor-default text-charcoal/40'
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 accent-flame"
                            disabled={it.paid}
                            checked={it.paid || selected.has(it.id)}
                            onChange={() => toggleItem(it.id)}
                          />
                          <span
                            className={cn('flex-1', it.paid && 'line-through')}
                          >
                            {it.name}{' '}
                            <span className="text-charcoal/40">
                              ×{it.quantity}
                            </span>
                          </span>
                          {it.paid ? (
                            <span className="rounded-full bg-status-paid/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-status-paid">
                              pago
                            </span>
                          ) : (
                            <span className="font-semibold text-charcoal">
                              {(it.price * it.quantity).toFixed(2)}€
                            </span>
                          )}
                        </label>
                      ))}
                    </div>

                    {ids.length > 0 && (
                      <div className="flex justify-end border-t border-charcoal/5 px-3 py-1.5">
                        <button
                          type="button"
                          onClick={() => toggleOrder(ids, allSelected)}
                          className="text-xs font-semibold text-flame"
                        >
                          {allSelected ? 'Desmarcar' : 'Pagar tudo'}
                        </button>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>

              {/* payment panel */}
              <div className="mt-2 space-y-3 rounded-2xl border border-charcoal/10 bg-charcoal/[0.02] p-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('Cash')}
                    className={cn(
                      'flex-1 rounded-full border-2 bg-white py-2 text-sm font-semibold transition-colors',
                      mode === 'Cash'
                        ? 'border-flame text-flame'
                        : 'border-charcoal/10 text-charcoal/60'
                    )}
                  >
                    <Wallet className="mr-1 inline h-4 w-4" />
                    Dinheiro
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('Online')}
                    className={cn(
                      'flex-1 rounded-full border-2 bg-white py-2 text-sm font-semibold transition-colors',
                      mode === 'Online'
                        ? 'border-flame text-flame'
                        : 'border-charcoal/10 text-charcoal/60'
                    )}
                  >
                    <CreditCard className="mr-1 inline h-4 w-4" />
                    Online
                  </button>
                </div>

                {mode === 'Cash' && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-charcoal/70">Recebido</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={received}
                      onChange={(e) => {
                        setAlert((a) => (a?.kind === 'error' ? null : a));
                        setReceived(e.target.value);
                      }}
                      placeholder="0.00"
                      className="w-28 rounded-lg border border-charcoal/15 bg-white px-2 py-1 text-right"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-charcoal/10 pt-3 font-display font-bold text-charcoal">
                  <span>
                    A pagar:{' '}
                    <span className="text-flame">{total.toFixed(2)}€</span>
                  </span>
                  {change !== null && (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        change < 0 ? 'text-charcoal/40' : 'text-status-paid'
                      )}
                    >
                      Troco: {change < 0 ? '—' : `${change.toFixed(2)}€`}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={saving || selected.size === 0}
                  className="jato-flame flex w-full items-center justify-center gap-2 rounded-full py-2.5 font-semibold text-white disabled:opacity-60"
                >
                  {saving && <Loader className="h-4 w-4 animate-spin" />}
                  {selected.size > 0
                    ? `Registar pagamento (${selected.size})`
                    : 'Registar pagamento'}
                </button>
              </div>
              </div>

              {/* alerts column — right lateral space */}
              <aside className="mt-4 border-t border-charcoal/10 pt-4 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                <div className="lg:sticky lg:top-4">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal/45">
                  Alertas
                </p>
                {alert ? (
                  <div
                    role="alert"
                    className={cn(
                      'flex items-start gap-2.5 rounded-2xl border p-3 text-sm',
                      alert.kind === 'error'
                        ? 'border-flame/30 bg-flame/5 text-flame'
                        : 'border-status-paid/30 bg-status-paid/10 text-status-paid'
                    )}
                  >
                    {alert.kind === 'error' ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span className="font-semibold leading-snug">
                      {alert.message}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-charcoal/10 p-3 text-sm text-charcoal/40">
                    Sem alertas
                  </div>
                )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
