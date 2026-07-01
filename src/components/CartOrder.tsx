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
  const formatedDate = format(data.created_at, "d 'de' MMM · HH:mm", {
    locale: pt,
  });

  const status = ORDER_STATUS_META[data.status];
  const hasPaidItems = data.order_items.some((it) => it.paid);

  const total = data.order_items
    .reduce((acc, obj) => acc + obj.price * obj.quantity, 0)
    .toFixed(2);

  return (
    <div className="flex w-[341px] flex-col self-stretch overflow-hidden rounded-3xl border border-charcoal/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* status spine */}
      <div className={cn('h-1.5 w-full', status.solid)} />

      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-base font-bold text-charcoal">
              Pedido #{data.order_number}
            </p>
            <span className="text-xs text-charcoal/45">{formatedDate}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="inline-flex rounded-full bg-charcoal px-2.5 py-1 text-xs font-semibold text-cream">
              Mesa {data.table}
            </span>
            {isAdmin && data.status !== 'Paid' ? (
              <OrderStatusSelect orderId={data.id} status={data.status} />
            ) : (
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  status.soft
                )}
              >
                {status.label}
              </span>
            )}
          </div>
        </div>

        {/* items */}
        <ul className="mt-4 divide-y divide-charcoal/5">
          {data.order_items.map((order_item) => {
            const struck = order_item.checked || order_item.paid;
            return (
              <li key={order_item.id} className="flex items-center gap-2.5 py-2">
                {isAdmin &&
                  (order_item.loading ? (
                    <Loader className="h-4 w-4 shrink-0 animate-spin text-flame" />
                  ) : (
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 accent-flame"
                      checked={order_item.checked}
                      onChange={(e) =>
                        handleCheckOrderItem(order_item.id, e.target.checked)
                      }
                    />
                  ))}
                <span
                  className={cn(
                    'flex-1 text-[15px] text-charcoal',
                    struck && 'text-charcoal/40 line-through'
                  )}
                >
                  {order_item.name}{' '}
                  <span className="text-charcoal/40">×{order_item.quantity}</span>
                </span>
                {order_item.paid && (
                  <span className="rounded-full bg-status-paid/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-status-paid">
                    pago
                  </span>
                )}
                <span className="w-16 shrink-0 text-right text-sm font-semibold text-charcoal">
                  {(order_item.price * order_item.quantity).toFixed(2)}€
                </span>
              </li>
            );
          })}
        </ul>

        {/* total */}
        <div className="mt-auto flex items-baseline justify-between border-t border-charcoal/10 pt-3">
          <span className="text-xs text-charcoal/45">
            {data.order_items.length} produto
            {data.order_items.length === 1 ? '' : 's'}
          </span>
          <p className="font-display text-lg font-bold text-charcoal">
            Total <span className="text-flame">{total}€</span>
          </p>
        </div>

        {/* actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <OrderCustomerPopover
                phone={data.phone_number}
                table={data.table}
                createdAt={data.created_at}
              />
            )}
            {isAdmin && data.status !== 'Paid' && !hasPaidItems && (
              <ModalEditOrder order={data} />
            )}
          </div>
          {isAdmin ? (
            data.status === 'Delivered' && <PaymentDrawer order={data} />
          ) : (
            <ButtonOrderAction status={data.status} order_id={data.id} />
          )}
        </div>
      </div>
    </div>
  );
};
