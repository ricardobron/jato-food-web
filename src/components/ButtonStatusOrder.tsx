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
      style: 'border-2 border-[#D634F0] bg-[#D634F0] px-2',
      onClick: () => handleChangeButtonStatusOrder('New'),
    },
    {
      type: 'ToDeliver',
      name: 'Por entregar',
      style: 'border-2 border-[#FBD0A9] bg-[#FBD0A9] px-2',
      onClick: () => handleChangeButtonStatusOrder('ToDeliver'),
    },
    {
      type: 'Paid',
      name: 'Pago',
      style: 'border-2 border-[#87B6A1] bg-[#87B6A1] px-2',
      onClick: () => handleChangeButtonStatusOrder('Paid'),
    },
    {
      type: 'Rejected',
      name: 'Recusado',
      style: 'border-2 border-[#E4A2B0] bg-[#E4A2B0] px-2',
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
