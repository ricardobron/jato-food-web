'use client';

import { Loader, MinusCircle, PlusCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getProducts } from '@/service/products';
import { cn } from '@/lib/utils';

interface Props {
  value: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
}

export const OrderProductPicker = ({ value, onChange }: Props) => {
  const session = useSession();

  const { data: products = [], isLoading } = useQuery({
    queryFn: () => getProducts(session.data?.jwt || ''),
    queryKey: ['/products'],
    enabled: !!session.data?.jwt,
  });

  if (isLoading) {
    return <Loader size={24} className="animate-spin text-flame" />;
  }

  function setQty(id: string, qty: number) {
    const next = { ...value };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    onChange(next);
  }

  return (
    <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
      {products.map((pr) => {
        const qty = value[pr.id] || 0;
        const active = qty > 0;
        return (
          <div
            key={pr.id}
            className={cn(
              'flex items-center justify-between rounded-xl border px-3 py-2',
              active ? 'border-flame/40 bg-flame/5' : 'border-charcoal/10'
            )}
          >
            <div>
              <p className="font-medium text-charcoal">{pr.name}</p>
              <p className="text-sm text-charcoal/50">{pr.price}€</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={qty < 1}
                onClick={() => setQty(pr.id, qty - 1)}
                className="text-charcoal/60 transition-colors hover:text-flame disabled:opacity-30"
              >
                <MinusCircle className="h-6 w-6" />
              </button>
              <span className="w-5 text-center font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(pr.id, qty + 1)}
                className="text-flame transition-transform hover:scale-110"
              >
                <PlusCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
