'use client';

import { useSocket } from '@/context/SocketContext';
import {
  ICreatedOrderSocket,
  IFindOrders,
  IOrderItemComponent,
  ISockeOrderItemUpdated,
  ISockeUpdateOrderItem,
  getOrders,
} from '@/service/order';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ButtonStatusOrder, IOrderStatusComponent } from './ButtonStatusOrder';
import { CartOrder } from './CartOrder';
import { ModalCreateOrder } from './ModalCreateOrder';
import { Loader } from 'lucide-react';
import { InputSelect } from './InputSelect';

export type Orders = Omit<IFindOrders, 'order_items'> & {
  order_items: IOrderItemComponent[];
};

export const Order = () => {
  const session = useSession();
  const { socket } = useSocket();

  const [orders, setOrders] = useState<Orders[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTable, setSelectedTable] = useState<string | undefined>('');

  const [buttonOrderStatus, setButtonStatus] =
    useState<IOrderStatusComponent>('All');

  const filterOrder = orders
    .filter((order) =>
      buttonOrderStatus === 'All' ? true : order.status === buttonOrderStatus
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  //order created
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

  //order updated
  useEffect(() => {
    socket?.on('order_updated', (data: ICreatedOrderSocket) => {
      setOrders((state) => {
        const _clone = [...state];

        const orderIndex = _clone.findIndex((pr) => pr.id === data.id);

        if (orderIndex !== -1) {
          _clone[orderIndex] = data;
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

  //order item updated
  useEffect(() => {
    if (session.data?.user.role !== 'ADMIN') return;

    socket?.on('order_item_updated', (data: ISockeOrderItemUpdated) => {
      setOrders((state) => {
        const _clone = [...state];

        const orderIndex = _clone.findIndex(
          (_order) => _order.id === data.order_id
        );
        if (orderIndex === -1) return _clone;

        const orderItemIndex = _clone[orderIndex].order_items.findIndex(
          (_orderItem) => _orderItem.id === data.id
        );
        if (orderItemIndex === -1) return _clone;

        _clone[orderIndex].order_items[orderItemIndex].checked = data.checked;
        _clone[orderIndex].order_items[orderItemIndex].loading = false;

        return _clone;
      });
    });

    return () => {
      socket?.off('order_item_updated');
    };
  }, [session.data?.user.role, socket]);

  //get orders
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

  const handleCheckOrderItem = useCallback(
    (order_id: string, order_item_id: string, checked: boolean) => {
      const data: ISockeUpdateOrderItem = { checked, order_item_id, order_id };

      setOrders((state) => {
        const _clone = [...state];

        const orderIndex = _clone.findIndex((_order) => _order.id === order_id);
        if (orderIndex === -1) return _clone;

        const orderItemIndex = _clone[orderIndex].order_items.findIndex(
          (_orderItem) => _orderItem.id === order_item_id
        );
        if (orderItemIndex === -1) return _clone;

        _clone[orderIndex].order_items[orderItemIndex].loading = true;

        return _clone;
      });

      socket?.emit('order_item_update', data);
    },
    [socket]
  );

  const tableOptions = useMemo(
    () =>
      Array.from(new Set(orders.map((o) => o.table)))
        .filter(Boolean)
        .sort((a, b) => String(a).localeCompare(String(b)))
        .map((t) => ({ label: `Mesa ${t}`, value: String(t) })),
    [orders]
  );

  const listToRender = selectedTable
    ? selectedTableGroup?.orders ?? []
    : filteredByStatus;

  return (
    <div className="flex w-[100%] flex-col items-center px-4 pt-6">
      {session.data?.user.role === 'ADMIN' && (
        <div className="mb-4 flex w-full justify-end">
          <ModalCreateOrder />
        </div>
      )}
      <ButtonStatusOrder onChange={(value) => setButtonStatus(value as any)} />

      <div className="mt-6 flex flex-row flex-wrap justify-center gap-6">
        {isLoading ? (
          <Loader size={30} className="animate-spin text-flame" />
        ) : filterOrder.length === 0 ? (
          <p className="mt-12 text-center text-charcoal/50">
            Ainda não há pedidos por aqui. Assim que entrar um, aparece neste
            instante.
          </p>
        ) : (
          <>
            {listToRender.map((pr) => (
              <CartOrder
                key={pr.id}
                data={pr}
                handleCheckOrderItem={(order_item_id, value) =>
                  handleCheckOrderItem(pr.id, order_item_id, value)
                }
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
