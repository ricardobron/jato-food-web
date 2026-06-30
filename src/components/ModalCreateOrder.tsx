'use client';

import { useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderProductPicker } from './OrderProductPicker';
import { createOrderAdmin } from '@/service/order';
import { getProducts } from '@/service/products';

export const ModalCreateOrder = () => {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const { data: products = [] } = useQuery({
    queryFn: () => getProducts(session.data?.jwt || ''),
    queryKey: ['/products'],
    enabled: !!session.data?.jwt,
  });

  const total = useMemo(
    () =>
      products
        .reduce((acc, p) => acc + (items[p.id] || 0) * p.price, 0)
        .toFixed(2),
    [products, items]
  );

  function reset() {
    setTable('');
    setPhone('');
    setItems({});
  }

  async function handleCreate() {
    if (!table) return toast.warning('Indica a mesa');
    if (!phone) return toast.warning('Indica o telemóvel');
    const products_ = Object.entries(items).map(([id, quantity]) => ({
      id,
      quantity,
    }));
    if (products_.length === 0) return toast.warning('Adiciona produtos');

    setSaving(true);
    try {
      await createOrderAdmin({
        table_number: table,
        phone_number: phone,
        products: products_,
      });
      toast.success('Pedido criado');
      reset();
      setOpen(false);
    } catch {
      toast.error('Não foi possível criar o pedido');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="jato-flame inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-white shadow-md shadow-flame/25 transition-transform hover:scale-[1.02]">
          <PlusCircle className="h-5 w-5" />
          Novo pedido
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Novo pedido</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Mesa</Label>
            <Input
              type="number"
              value={table}
              onChange={(e) => setTable(e.target.value)}
            />
          </div>
          <div>
            <Label>Telemóvel</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <OrderProductPicker value={items} onChange={setItems} />
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-charcoal">
            Total: <span className="text-flame">{total}€</span>
          </span>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="jato-flame rounded-full px-5 py-2 font-semibold text-white disabled:opacity-60"
          >
            Criar pedido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
