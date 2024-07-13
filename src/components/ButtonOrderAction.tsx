import { OrderStatus, updateOrder } from '@/service/order';
import { ButtonProps } from './Button';
import { cn } from '@/lib/utils';
import { type ClassValue } from 'clsx';
import { useSession } from 'next-auth/react';

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
      name: isClient ? 'Em preparação' : 'Entregar',
      onClick: () => handleClickButtonOrder('Delivered'),
      style: 'border-2 border-[#ADD8E6] bg-[#ADD8E6]/10 text-[#ADD8E6]',
      disabled: isClient,
    },
    Delivered: {
      name: 'Entregue / Pagar',
      style: 'border-2 border-[#006400] bg-[#006400]/10 text-[#006400]',
      disabled: isClient,
      onClick: () => handleClickButtonOrder('Paid'),
    },
    Paid: {
      name: 'Pago',
      style: 'border-2 border-[#32CD32] bg-[#32CD32]/10 text-[#32CD32]',
      disabled: true,
    },
  };

  return (
    <button
      className={cn('p-1 rounded-lg', configButton[status]?.style)}
      disabled={configButton[status]?.disabled}
      onClick={configButton[status]?.onClick}
    >
      {configButton[status]?.name || ''}
    </button>
  );
};
