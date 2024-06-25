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
    // console.log({ status });

    if (status === 'Unpaid') {
      updateOrder({ status: 'Unpaid', order_id: order_id });
    }

    if (status === 'Rejected') {
      updateOrder({ status: 'Rejected', order_id: order_id });
    }

    if (status === 'Paid') {
      updateOrder({ status: 'Paid', order_id: order_id });
    }

    if (status === 'Preparing') {
      updateOrder({ status: 'Preparing', order_id: order_id });
    }

    if (status === 'ToDeliver') {
      updateOrder({ status: 'ToDeliver', order_id: order_id });
    }

    if (status === 'Delivered') {
      updateOrder({ status: 'Delivered', order_id: order_id });
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
    New: {
      name: isClient ? 'Por validar' : 'Validar',
      onClick: () => handleClickButtonOrder('Unpaid'),
      style: 'border-2 border-[#1E90FF] bg-[#1E90FF]/10 text-[#1E90FF]',
      disabled: isClient,
    },
    Unpaid: {
      name: isClient ? 'Por pagar' : 'Pagar',
      onClick: () => handleClickButtonOrder('Paid'),
      style: 'border-2 border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]',
      disabled: isClient,
    },
    Paid: {
      name: isClient ? 'A preparar' : 'Preparar',
      onClick: () => handleClickButtonOrder('Preparing'),
      style: 'border-2 border-[#32CD32] bg-[#32CD32]/10 text-[#32CD32]',
      disabled: isClient,
    },
    Preparing: {
      name: isClient ? 'Em preparação' : 'Pronto',
      onClick: () => handleClickButtonOrder('ToDeliver'),
      style: 'border-2 border-[#ADD8E6] bg-[#ADD8E6]/10 text-[#ADD8E6]',
      disabled: isClient,
    },
    ToDeliver: {
      name: isClient ? 'Por entregar' : 'Entregar',
      onClick: () => handleClickButtonOrder('Delivered'),
      style: 'border-2 border-[#FFA500] bg-[#FFA500]/10 text-[#FFA500]',
      disabled: isClient,
    },
    Delivered: {
      name: 'Entrege',
      style: 'border-2 border-[#006400] bg-[#006400]/10 text-[#006400]',
      disabled: true,
    },
    Rejected: {
      name: 'Recusado',
      onClick: () => handleClickButtonOrder('Rejected'),
      style: 'border-2 border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500]',
      disabled: status === 'Rejected' || isClient,
    },
  };

  if (status === 'New') {
    return (
      <div className="space-x-3">
        {!isClient && (
          <button
            className={cn('p-1 rounded-lg', configButton['Rejected']?.style)}
            disabled={configButton['Rejected']?.disabled}
            onClick={configButton['Rejected']?.onClick}
          >
            Recusar
          </button>
        )}

        <button
          className={cn('p-1 rounded-lg', configButton[status]?.style)}
          disabled={configButton[status]?.disabled}
          onClick={configButton[status]?.onClick}
        >
          {configButton[status]?.name || ''}
        </button>
      </div>
    );
  } else {
    <button
      className={cn('p-1 rounded-lg', configButton[status]?.style)}
      disabled={configButton[status]?.disabled}
      onClick={configButton[status]?.onClick}
    >
      {configButton[status]?.name || ''}
    </button>;
  }

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
