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
    console.log({ status });

    if (status === 'New') {
      updateOrder({ status: 'ToDeliver', order_id: order_id });
    }

    if (status === 'Rejected') {
      updateOrder({ status: 'Rejected', order_id: order_id });
    }

    if (status === 'ToDeliver') {
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
    ToDeliver: {
      name: isClient ? 'Por pagar' : 'Pagar',
      onClick: () => handleClickButtonOrder('ToDeliver'),
      style: 'border-2 border-[#FBD0A9] bg-[#FBD0A]/10 text-[#FBD0A9]',
      disabled: isClient,
    },
    New: {
      name: 'Por validar',
      onClick: () => handleClickButtonOrder('New'),
      style: 'border-2 border-[#D634F0] bg-[#D634F0]/10 text-[#D634F0]',
      disabled: isClient,
    },
    Paid: {
      name: 'Pago',
      onClick: () => {},
      style: 'border-2 border-[#87B6A1] bg-[#87B6A1]/10 text-[#87B6A1]',
      disabled: true,
    },
    Rejected: {
      name: 'Recusado',
      onClick: () => handleClickButtonOrder('Rejected'),
      style: 'border-2 border-[#E4A2B0] bg-[#E4A2B0]/10 text-[#E4A2B0]',
      disabled: status === 'Rejected' || isClient,
    },
  };

  if (status === 'New') {
    return (
      <div className="space-x-3">
        <button
          className={cn('p-1 rounded-lg', configButton['Rejected']?.style)}
          disabled={configButton['Rejected']?.disabled}
          onClick={configButton['Rejected']?.onClick}
        >
          Recusar
        </button>

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
