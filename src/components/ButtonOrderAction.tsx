import { OrderStatus, updateOrder } from '@/service/order';
import { cn } from '@/lib/utils';
import { type ClassValue } from 'clsx';
import { useSession } from 'next-auth/react';
import { ORDER_STATUS_META } from '@/constants/orderStatus';

type ButtonOrderProps = {
  status: OrderStatus;
  order_id: string;
};

export const ButtonOrderAction = ({ status, order_id }: ButtonOrderProps) => {
  const session = useSession();

  const isClient = session.data?.user.role === 'USER';

  function handleClickButtonOrder(status: OrderStatus) {
    if (status === 'Preparing') {
      updateOrder({ status: 'Preparing', order_id: order_id });
    }

    if (status === 'Delivered') {
      updateOrder({ status: 'Delivered', order_id: order_id });
    }

    if (status === 'Paid') {
      updateOrder({ status: 'Paid', order_id: order_id });
    }
  }

  const configButton: Record<
    OrderStatus,
    {
      name: string;
      onClick?: () => void;
      style: ClassValue;
      disabled?: boolean;
    }
  > = {
    Preparing: {
      name: isClient ? 'Em preparação' : 'Marcar entregue',
      onClick: () => handleClickButtonOrder('Delivered'),
      style: cn('border-2', ORDER_STATUS_META.Preparing.border, ORDER_STATUS_META.Preparing.soft),
      disabled: isClient,
    },
    Delivered: {
      name: isClient ? 'Entregue' : 'Marcar pago',
      style: cn('border-2', ORDER_STATUS_META.Delivered.border, ORDER_STATUS_META.Delivered.soft),
      disabled: isClient,
      onClick: () => handleClickButtonOrder('Paid'),
    },
    Paid: {
      name: 'Pago',
      style: cn('border-2', ORDER_STATUS_META.Paid.border, ORDER_STATUS_META.Paid.soft),
      disabled: true,
    },
  };

  return (
    <button
      className={cn(
        'rounded-full px-3 py-1.5 text-sm font-semibold transition-opacity disabled:cursor-default disabled:opacity-90 enabled:hover:opacity-80',
        configButton[status]?.style
      )}
      disabled={configButton[status]?.disabled}
      onClick={configButton[status]?.onClick}
    >
      {configButton[status]?.name || ''}
    </button>
  );
};
