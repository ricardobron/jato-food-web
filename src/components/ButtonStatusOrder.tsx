import { cn } from '@/lib/utils';
import { OrderStatus } from '@/service/order';
import { useState } from 'react';

interface IPropsButtonStatusOrder {
  onChange?: (value: string) => void;
}

export type IOrderStatusComponent = OrderStatus | 'All';

export const ButtonStatusOrder = ({ onChange }: IPropsButtonStatusOrder) => {
  const [buttonStatusOrder, setButtonStatusOrder] =
    useState<IOrderStatusComponent>('All');

  function handleChangeButtonStatusOrder(value: IOrderStatusComponent) {
    setButtonStatusOrder(value);
    onChange?.(value);
  }

  const orderStatus = [
    {
      type: 'All',
      name: 'Todos',
      style: 'text-black border-2 border-black',
      onClick: () => handleChangeButtonStatusOrder('All'),
    },
    {
      type: 'New',
      name: 'Por Validar',
      style: 'border-2 border-[#1E90FF] bg-[#1E90FF] px-2',
      onClick: () => handleChangeButtonStatusOrder('New'),
    },
    {
      type: 'Unpaid',
      name: 'Por pagar',
      style: 'border-2 border-[#FFD700] bg-[#FFD700] px-2',
      onClick: () => handleChangeButtonStatusOrder('Unpaid'),
    },
    {
      type: 'Paid',
      name: 'Pago',
      style: 'border-2 border-[#32CD32] bg-[#32CD32] px-2',
      onClick: () => handleChangeButtonStatusOrder('Paid'),
    },
    {
      type: 'Preparing',
      name: 'A preparar',
      style: 'border-2 border-[#ADD8E6] bg-[#ADD8E6] px-2',
      onClick: () => handleChangeButtonStatusOrder('Preparing'),
    },
    {
      type: 'ToDeliver',
      name: 'Por entregar',
      style: 'border-2 border-[#FFA500] bg-[#FFA500] px-2',
      onClick: () => handleChangeButtonStatusOrder('ToDeliver'),
    },

    {
      type: 'Delivered',
      name: 'Entregue',
      style: 'border-2 border-[#006400] bg-[#006400] px-2',
      onClick: () => handleChangeButtonStatusOrder('Delivered'),
    },
    {
      type: 'Rejected',
      name: 'Recusado',
      style: 'border-2 border-[#FF4500] bg-[#FF4500] px-2',
      onClick: () => handleChangeButtonStatusOrder('Rejected'),
    },
  ];

  return (
    <div className="flex justify-center items-center flex-wrap gap-2">
      {orderStatus.map((orderButton) => (
        <button
          key={orderButton.type}
          onClick={orderButton.onClick}
          className={cn(
            'p-1 rounded-lg',
            orderButton.style,
            buttonStatusOrder === orderButton.type ? 'font-semibold' : ''
          )}
        >
          <p>{orderButton.name}</p>
        </button>
      ))}
    </div>
  );
};
