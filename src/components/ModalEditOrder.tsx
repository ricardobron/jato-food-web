'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderProductPicker } from './OrderProductPicker';
import { updateOrderItems } from '@/service/order';
import { getProducts } from '@/service/products';
import { Orders } from './Order';

interface Props {
  order: Orders;
}

export const ModalEditOrder = ({ order }: Props) => {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: products = [] } = useQuery({
    queryFn: () => getProducts(session.data?.jwt || ''),
    queryKey: ['/products'],
    enabled: !!session.data?.jwt,
  });

  // mapa inicial productId->quantity. order_items tem name; cruzar por name→id.
  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    order.order_items.forEach((it) => {
      const product = products.find((p) => p.name === it.name);
      if (product) map[product.id] = it.quantity;
    });
    return map;
  }, [order.order_items, products]);

  const [items, setItems] = useState<Record<string, number>>(initial);

  // re-sync quando os produtos carregam (initial passa de {} a preenchido)
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const total = useMemo(
    () =>
      products
        .reduce((acc, p) => acc + (items[p.id] || 0) * p.price, 0)
        .toFixed(2),
    [products, items]
  );

  async function handleSave() {
    const products_ = Object.entries(items).map(([id, quantity]) => ({
      id,
      quantity,
    }));
    if (products_.length === 0) return toast.warning('Adiciona produtos');
    setSaving(true);
    try {
      await updateOrderItems(order.id, products_);
      toast.success('Pedido atualizado');
      setOpen(false);
    } catch {
      toast.error('Não foi possível atualizar o pedido');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="Editar pedido"
          className="text-charcoal/50 transition-colors hover:text-flame"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Editar pedido #{order.order_number}
          </DialogTitle>
        </DialogHeader>
        <OrderProductPicker value={items} onChange={setItems} />
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-charcoal">
            Total: <span className="text-flame">{total}€</span>
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="jato-flame rounded-full px-5 py-2 font-semibold text-white disabled:opacity-60"
          >
            Guardar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
