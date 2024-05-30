'use client';

import { useGeneral } from '@/store/general';
import { NewOrder } from '@/components/NewOrder';
import { Order } from '@/components/Order';

export const ClientComponentPage = () => {
  const { buttonOption } = useGeneral();

  if (buttonOption === 'my_orders') {
    return <Order />;
  } else {
    return <NewOrder />;
  }
};
