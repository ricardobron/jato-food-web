'use client';

import { useSocket } from '@/context/SocketContext';
import {
  ICreatedOrderSocket,
  IFindOrders,
  OrderStatus,
  getOrders,
} from '@/service/order';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ButtonStatusOrder, IOrderStatusComponent } from './ButtonStatusOrder';
import { CartOrder } from './CartOrder';
import { Loader } from 'lucide-react';

export const Order = () => {
  const session = useSession();
  const { socket } = useSocket();

  const [orders, setOrders] = useState<IFindOrders[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [buttonOrderStatus, setButtonStatus] =
    useState<IOrderStatusComponent>('All');

  const statusOrderTranslate: Record<OrderStatus, string> = {
    Delivered: 'entregue',
    Paid: 'pago',
    Preparing: 'em preparação',
  };

  const filterOrder = orders.filter((order) =>
    buttonOrderStatus === 'All' ? true : order.status === buttonOrderStatus
  );

  useEffect(() => {
    socket?.on('order_created', (data: ICreatedOrderSocket) => {
      toast.success(`Pedido ${data.order_number} criado`, {
        closeButton: true,
        duration: Infinity,
      });

      setOrders((state) => {
        const _clone = [...state];

        const orderIndex = _clone.findIndex((pr) => pr.id === data.id);

        if (orderIndex !== -1) {
          toast.warning(`Pedido ${data.order_number} mal formatado`, {
            description: 'Atualize a página',
          });
        } else {
          _clone.push(data);
        }

        return _clone;
      });
    });

    return () => {
      socket?.off('order_created');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    socket?.on('order_updated', (data: ICreatedOrderSocket) => {
      if (Notification.permission === 'granted') {
        new Notification(`Pedido ${data.order_number}`, {
          body: `Pedido nº ${data.order_number} mudou de estado para ${
            statusOrderTranslate[data.status]
          }.`,
        });
      }

      setOrders((state) => {
        const _clone = [...state];

        const orderIndex = _clone.findIndex((pr) => pr.id === data.id);

        if (orderIndex !== -1) {
          _clone[orderIndex].status = data.status;
        } else {
          _clone.push(data);
        }

        return _clone;
      });
    });

    return () => {
      socket?.off('order_updated');
    };
  }, [socket]);

  useEffect(() => {
    if (!session.data?.jwt) return;

    (async () => {
      try {
        const response = await getOrders(session.data.jwt);

        setOrders(response);
        setIsLoading(false);
      } catch {
        toast.error('Não foi possível carregar os pedidos');

        setIsLoading(false);
      }
    })();
  }, [session.data?.jwt]);

  return (
    <div className="pt-4 w-[100%] px-4 flex flex-col items-center">
      <ButtonStatusOrder onChange={(value) => setButtonStatus(value as any)} />

      <div className="flex flex-row gap-6 flex-wrap justify-center mt-4">
        {isLoading ? (
          <Loader size={30} className="animate-spin text-orange-400" />
        ) : (
          <>
            {filterOrder.map((pr) => (
              <CartOrder key={pr.id} data={pr} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
