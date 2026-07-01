import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ButtonOrderAction } from './ButtonOrderAction';
import { useSession } from 'next-auth/react';
import { Orders } from './Order';
import { Loader } from 'lucide-react';
import { ORDER_STATUS_META } from '@/constants/orderStatus';
import { OrderCustomerPopover } from './OrderCustomerPopover';
import { OrderStatusSelect } from './OrderStatusSelect';
import { ModalEditOrder } from './ModalEditOrder';
import { PaymentDrawer } from './PaymentDrawer';

interface IPropsCartOrder {
  data: Orders;
  handleCheckOrderItem: (order_item_id: string, checked: boolean) => void;
}

export const CartOrder = ({ data, handleCheckOrderItem }: IPropsCartOrder) => {
  const { data: user } = useSession();
  const isAdmin = user?.user.role === 'ADMIN';
  const formatedDate = format(data.created_at, 'PP, HH:mm', { locale: pt });

  const status = ORDER_STATUS_META[data.status];

  const total = data.order_items
    .reduce((acc, obj) => acc + obj.price * obj.quantity, 0)
    .toFixed(2);

  return (
    <div className="w-[341px] overflow-hidden rounded-3xl border border-charcoal/10 bg-white pb-3 shadow-sm transition-shadow hover:shadow-md">
      {/* status spine */}
      <div className={cn('h-1.5 w-full', status.solid)} />

      <div className="mt-3 flex flex-col px-5">
        <div className="flex flex-row items-start justify-between">
          <div>
            <p className="font-display text-base font-bold text-charcoal">
              Pedido #{data.order_number}
            </p>
            <span className="text-sm text-charcoal/50">{formatedDate}</span>
          </div>
          <div className="text-right">
            <span className="inline-flex rounded-full bg-charcoal px-2.5 py-1 text-xs font-semibold text-cream">
              Mesa {data.table}
            </span>
            {isAdmin ? (
              <div className="mt-1.5">
                <OrderStatusSelect orderId={data.id} status={data.status} />
              </div>
            ) : (
              <p
                className={cn(
                  'mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  status.soft
                )}
              >
                {status.label}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {data.order_items.map((order_item, index) => (
            <div
              className="flex flex-row items-center border-b border-charcoal/10 pb-2 text-[15px]"
              key={index}
            >
              {user?.user.role === 'ADMIN' && (
                <>
                  {order_item.loading ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin text-flame" />
                  ) : (
                    <input
                      type="checkbox"
                      className="mr-2.5 h-4 w-4 accent-flame"
                      checked={order_item.checked}
                      onChange={(e) =>
                        handleCheckOrderItem(order_item.id, e.target.checked)
                      }
                    />
                  )}
                </>
              )}
              <p
                className={cn(
                  'flex-1',
                  (order_item.checked || order_item.paid) &&
                    'text-charcoal/40 line-through'
                )}
              >
                {order_item.name}
              </p>
              <p className="mr-4 text-charcoal/60">{order_item.price}€</p>
              <p className="w-[55px] text-end font-medium">
                Qtd: {order_item.quantity}
              </p>
              {order_item.paid && (
                <span className="ml-2 rounded-full bg-status-paid/10 px-2 text-xs font-semibold text-status-paid">
                  pago
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 self-end font-display text-base font-bold text-charcoal">
          Total: <span className="text-flame">{total}€</span>
        </p>
        <div className="mt-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-charcoal/50">
              {data.order_items.length} produto
              {data.order_items.length === 1 ? '' : 's'}
            </span>
            {isAdmin && (
              <OrderCustomerPopover
                phone={data.phone_number}
                table={data.table}
                createdAt={data.created_at}
              />
            )}
            {isAdmin && data.status !== 'Paid' && <ModalEditOrder order={data} />}
            {isAdmin && data.status !== 'Paid' && <PaymentDrawer order={data} />}
          </div>
          <ButtonOrderAction status={data.status} order_id={data.id} />
        </div>
      </div>
    </div>
  );
};
