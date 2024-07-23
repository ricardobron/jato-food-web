import { IFindOrders, OrderStatus } from '@/service/order';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ButtonOrderAction } from './ButtonOrderAction';
import { useSession } from 'next-auth/react';
import { Orders } from './Order';
import { Loader } from 'lucide-react';

interface IPropsCartOrder {
  data: Orders;
  handleCheckOrderItem: (order_item_id: string, checked: boolean) => void;
}

export const CartOrder = ({ data, handleCheckOrderItem }: IPropsCartOrder) => {
  const { data: user } = useSession();
  const formatedDate = format(data.created_at, 'PP, HH:mm', { locale: pt });

  const orderColors: Record<OrderStatus, string> = {
    Preparing: 'bg-[#ADD8E6]',
    Delivered: 'bg-[#006400]',
    Paid: 'bg-[#32CD32]',
  };

  const borderColors: Record<OrderStatus, string> = {
    Preparing: 'border-[#ADD8E6]',
    Delivered: 'border-[#006400]',
    Paid: 'border-[#32CD32]',
  };

  const total = data.order_items
    .reduce((acc, obj) => acc + obj.price * obj.quantity, 0)
    .toFixed(2);

  return (
    <div
      className={cn(
        'w-[341px] border-2 rounded-lg pb-2',
        borderColors[data.status]
      )}
    >
      <div
        className={cn('h-3 w-full rounded-t-sm', orderColors[data.status])}
      />

      <div className="flex flex-col px-5 mt-2">
        <div className="flex flex-row justify-between">
          <div>
            <p className="text-[16px] font-medium">
              Pedido: #{data.order_number}
            </p>
            <span className="text-[14px] font-normal text-[#797B7E]">
              {formatedDate}
            </span>
          </div>
          <div>
            <p className="text-[16px] font-medium">Mesa {data.table}</p>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          {data.order_items.map((order_item, index) => (
            <div
              className="flex flex-row text-[16px] font-normal border-b-2 pb-2"
              key={index}
            >
              {user?.user.role === 'ADMIN' && (
                <>
                  {order_item.loading ? (
                    <Loader className="animate-spin " />
                  ) : (
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={order_item.checked}
                      onChange={(e) =>
                        handleCheckOrderItem(order_item.id, e.target.checked)
                      }
                    />
                  )}
                </>
              )}
              <p className="flex-1">{order_item.name}</p>
              <p className="mr-4">{order_item.price}€</p>
              <p className="w-[55px] text-end">Qtd: {order_item.quantity}</p>
            </div>
          ))}
        </div>
        <p className="text-end mt-2 self-end">Total: {total}€</p>
        <div className="flex flex-row justify-between mt-2 items-center">
          <span className="text-[14px] text-[#797B7E]">
            X{data.order_items.length} Produtos
          </span>
          <ButtonOrderAction status={data.status} order_id={data.id} />
        </div>
      </div>
    </div>
  );
};
