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

  const filteredByStatus = useMemo(() => {
    return orders.filter((order) =>
      buttonOrderStatus === 'All' ? true : order.status === buttonOrderStatus
    );
  }, [orders, buttonOrderStatus]);

  const selectedTableGroup = useMemo(() => {
    if (!selectedTable) return null;
    const group = filteredByStatus
      .filter((o) => String(o.table) === String(selectedTable))
      .sort((a, b) => {
        const aT = (a as any).updated_at ?? (a as any).created_at ?? 0;
        const bT = (b as any).updated_at ?? (b as any).created_at ?? 0;
        return bT - aT; // mais recente primeiro
      });

    return {
      table: selectedTable,
      orders: group,
    };
  }, [filteredByStatus, selectedTable]);

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
    <div className="pt-4 w-[100%] px-4 flex flex-col items-center">
      <ButtonStatusOrder onChange={(value) => setButtonStatus(value as any)} />

      {session.data?.user.role === 'ADMIN' && (
        <>
          <div className=" w-full mt-6 max-w-[640px] mx-auto flex justify-center gap-2 items-center">
            <InputSelect
              value={selectedTable || ''}
              onChange={(v?: string) => setSelectedTable(v || '')}
              options={[
                { label: 'Todas as mesas', value: '' },
                ...tableOptions,
              ]}
            />
            {selectedTable && (
              <button
                className="text-sm underline"
                onClick={() => setSelectedTable('')}
              >
                Limpar mesa
              </button>
            )}
          </div>

          {selectedTable && (
            <h3 className="mt-4 text-lg font-semibold">
              Mesa {selectedTable} — {selectedTableGroup?.orders.length ?? 0}{' '}
              pedidos
            </h3>
          )}
        </>
      )}

      <div className="flex flex-row gap-6 flex-wrap justify-center mt-4">
        {isLoading ? (
          <Loader size={30} className="animate-spin text-orange-400" />
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
