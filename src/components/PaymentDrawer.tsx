'use client';

import { useMemo, useState } from 'react';
import { CreditCard, Loader, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

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
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleOrder(ids: string[], allSelected: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  async function handlePay() {
    if (selected.size === 0) return toast.warning('Seleciona itens para pagar');
    if (mode === 'Cash' && (received === '' || Number(received) < total)) {
      return toast.warning('Dinheiro recebido insuficiente');
    }
    setSaving(true);
    try {
      const res = await createPayment({
        order_item_ids: Array.from(selected).filter((id) => unpaidItems.has(id)),
        mode,
        received: mode === 'Cash' ? Number(received) : undefined,
      });
      toast.success(
        res.change != null ? `Pago. Troco: ${res.change}€` : 'Pagamento registado'
      );
      setSelected(new Set());
      setReceived('');
      await refetch();
    } catch {
      toast.error('Não foi possível registar o pagamento');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setSelected(new Set());
          setMode('Cash');
          setReceived('');
        }
      }}
    >
      <DrawerTrigger asChild>
        <button
          title="Pagar"
          className="text-charcoal/50 transition-colors hover:text-flame"
        >
          <Wallet className="h-4 w-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto px-4 pb-8 max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="font-display">
              Pagamento · {group?.phone_number ?? ''}
            </DrawerTitle>
            <DrawerDescription className="sr-only">Selecione os itens a pagar</DrawerDescription>
          </DrawerHeader>

          {isLoading ? (
            <Loader className="mt-6 h-6 w-6 animate-spin text-flame" />
          ) : (
            <div className="mt-4 flex-1 space-y-4">
              {group?.orders.map((o) => {
                const unpaid = o.items.filter((it) => !it.paid);
                const ids = unpaid.map((it) => it.id);
                const allSelected =
                  ids.length > 0 && ids.every((id) => selected.has(id));
                return (
                  <div
                    key={o.id}
                    className="rounded-xl border border-charcoal/10 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-charcoal">
                        #{o.order_number} · Mesa {o.table}
                      </p>
                      {ids.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleOrder(ids, allSelected)}
                          className="text-xs font-semibold text-flame"
                        >
                          {allSelected ? 'Desmarcar' : 'Pagar pedido'}
                        </button>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      {o.items.map((it) => (
                        <label
                          key={it.id}
                          className={cn(
                            'flex items-center gap-2 text-sm',
                            it.paid && 'text-charcoal/40 line-through'
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-flame"
                            disabled={it.paid}
                            checked={it.paid || selected.has(it.id)}
                            onChange={() => toggleItem(it.id)}
                          />
                          <span className="flex-1">
                            {it.name} x{it.quantity}
                          </span>
                          <span>
                            {it.paid
                              ? 'pago'
                              : `${(it.price * it.quantity).toFixed(2)}€`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('Cash')}
                  className={cn(
                    'flex-1 rounded-full border-2 py-2 text-sm font-semibold',
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
                    'flex-1 rounded-full border-2 py-2 text-sm font-semibold',
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
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className="w-28 rounded-lg border border-charcoal/15 px-2 py-1 text-right"
                  />
                </div>
              )}

              <div className="flex items-center justify-between font-display font-bold text-charcoal">
                <span>
                  A pagar: <span className="text-flame">{total.toFixed(2)}€</span>
                </span>
                {change !== null && (
                  <span className="text-sm">
                    Troco: {change < 0 ? '—' : `${change.toFixed(2)}€`}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={saving || selected.size === 0}
                className="jato-flame w-full rounded-full py-2.5 font-semibold text-white disabled:opacity-60"
              >
                Registar pagamento
              </button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
