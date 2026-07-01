'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PlusCircle } from 'lucide-react';

import Swal from 'sweetalert2';

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

    const cartOrder = cart.filter((_cart) => _cart.quantity > 0);

    if (!table) {
      setShowAlertMissingTable(true);

      return;
    }

    if (cartOrder.length === 0) {
      toast.warning('Pedido incompleto', {
        description: 'Tente adicionar mais produtos',
        duration: 8000,
      });

      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Deseja confirmar o pedido?',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar',
        confirmButtonColor: '#FF5A1F',
        cancelButtonColor: '#3A2E26',
      });

      if (result.isConfirmed) {
        const products = cart
          .filter((product) => product.quantity > 0)
          .map((product) => ({
            id: product.id,
            quantity: product.quantity,
          }));

        if (products.length === 0) {
          toast.warning('Pedido incompleto', {
            description: 'Adiciona pelo menos um produto com quantidade',
            duration: 8000,
          });
          return;
        }

        await createOrder({
          products,
          table_number: String(table),
        });

        clearCart();
        handleChangeButtonOption('my_orders');
      }
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
            value={table ?? ''}
            onChange={(e) => setTable(Number(e.target.value))}
            disabled
          />
        </div>
        <div>
          <button
            className="jato-flame inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-white shadow-md shadow-flame/25 transition-transform hover:scale-[1.02]"
            onClick={handleCreateOrder}
          >
            <PlusCircle className="h-5 w-5" />
            Criar pedido
          </button>
        </div>
      </div>

      <ListProducts />

      <footer className="mt-2 flex flex-col items-end rounded-full bg-charcoal px-5 py-2 text-cream">
        <div className="font-display">
          <span className="text-sm uppercase tracking-wide text-cream/70">
            Total:{' '}
          </span>
          <strong className="text-lg text-ember">{totalParsed}€</strong>
        </div>
      </footer>

      <AlertMissingTable
        open={showAlertMissingTable}
        onChange={setShowAlertMissingTable}
      />
    </div>
  );
};
