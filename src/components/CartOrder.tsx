import { IFindOrders, OrderStatus } from '@/service/order';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ButtonOrderAction } from './ButtonOrderAction';

interface IPropsCartOrder {
  data: IFindOrders;
}

export const CartOrder = ({ data }: IPropsCartOrder) => {
  const formatedDate = format(data.created_at, 'PP, HH:mm', { locale: pt });

  const orderColors: Record<OrderStatus, string> = {
    New: 'bg-[#D634F0]',
    Paid: 'bg-[#87B6A1]',
    Rejected: 'bg-[#E4A2B0]',
    ToDeliver: 'bg-[#FBD0A9]',
  };

  const borderColors: Record<OrderStatus, string> = {
    New: 'border-[#D634F0]',
    Paid: 'border-[#87B6A1]',
    Rejected: 'border-[#E4A2B0]',
    ToDeliver: 'border-[#FBD0A9]',
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
              <p className="flex-1">{order_item.name}</p>
              <p className="mr-4">{order_item.price}€</p>
              <p className="w-[55px] text-end">Qtd: {order_item.quantity}</p>
            </div>
          ))}
        </div>
        <p className="text-end mt-2">Total: {total}€</p>
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
