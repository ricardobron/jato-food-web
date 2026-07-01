import { cn } from '@/lib/utils';
import { OrderStatus } from '@/service/order';
import { ORDER_STATUS_META } from '@/constants/orderStatus';
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

  const filters: { type: IOrderStatusComponent; name: string }[] = [
    { type: 'All', name: 'Todos' },
    ...(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((status) => ({
      type: status,
      name: ORDER_STATUS_META[status].label,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {filters.map((filter) => {
        const isActive = buttonStatusOrder === filter.type;
        const activeClass =
          filter.type === 'All'
            ? 'jato-flame text-white border-transparent shadow-sm shadow-flame/30'
            : cn(
                ORDER_STATUS_META[filter.type as OrderStatus].solid,
                'border-transparent'
              );

        return (
          <button
            key={filter.type}
            onClick={() => handleChangeButtonStatusOrder(filter.type)}
            className={cn(
              'rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors',
              isActive
                ? activeClass
                : 'border-charcoal/15 text-charcoal/70 hover:border-charcoal/30 hover:text-charcoal'
            )}
          >
            {filter.name}
          </button>
        );
      })}
    </div>
  );
};
