'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PlusCircle } from 'lucide-react';

import { InputText } from './InputText';
import { ListProducts } from './ListProducts';

import { api } from '@/lib/api';
import { createOrder } from '@/service/order';
import { useCart } from '@/store/cart';
import { AlertMissingTable } from './AlertMissingTable';
import { toast } from 'sonner';
import { useGeneral } from '@/store/general';

export const NewOrder = () => {
  const session = useSession();
  const { cart, clearCart } = useCart();
  const { handleChangeButtonOption } = useGeneral();

  const [table, setTable] = useState<number | undefined>(undefined);
  const [showAlertMissingTable, setShowAlertMissingTable] = useState(false);

  const total = cart.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const totalParsed = (Math.round(total * 100) / 100).toFixed(2);

  async function handleCreateOrder() {
    api.defaults.headers.Authorization = `Bearer ${session.data?.jwt}`;

    if (!table) {
      setShowAlertMissingTable(true);

      return;
    }

    if (cart.length === 0) {
      toast.warning('Pedido incompleto', {
        description: 'Tente adicionar mais produtos',
        duration: 8000,
      });

      return;
    }

    try {
      await createOrder({
        products: cart.map((product) => ({
          id: product.id,
          quantity: product.quantity,
        })),
        table: String(table),
      });

      clearCart();
      handleChangeButtonOption('my_orders');
    } catch {
      toast.error('Não foi possível criar o pedido');
    }
  }

  useEffect(() => {
    const tableStorage = localStorage.getItem('@JATO:FOOD:TABLE');

    if (tableStorage) {
      setTable(Number(tableStorage));
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="text-center flex justify-center items-center w-[20%] mb-6">
          <InputText
            label="Mesa"
            type="number"
            value={Number(table)}
            onChange={(e) => setTable(Number(e.target.value))}
            disabled
          />
        </div>
        <div>
          <button
            className="p-2 rounded-lg text-white bg-[#FABF35] font-medium inline-flex gap-2"
            onClick={handleCreateOrder}
          >
            <PlusCircle className="text-white" />
            Criar pedido
          </button>
        </div>
      </div>

      <ListProducts />

      <footer className="flex flex-col items-end border-b-2 border-b-[#FABF35] p-2">
        <div>
          <span>TOTAL: </span>
          <strong className="text-[14px]">{totalParsed}€</strong>
        </div>
      </footer>

      <AlertMissingTable
        open={showAlertMissingTable}
        onChange={setShowAlertMissingTable}
      />
    </div>
  );
};
