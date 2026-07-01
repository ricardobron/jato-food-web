'use client';

import { useGeneral } from '@/store/general';
import { NewOrder } from '@/components/NewOrder';
import { Order } from '@/components/Order';
import { NotificationNoticeModal } from '@/components/NotificationNoticeModal';

export const ClientComponentPage = () => {
  const { buttonOption } = useGeneral();

  return (
    <>
      <NotificationNoticeModal />
      {buttonOption === 'my_orders' ? <Order /> : <NewOrder />}
    </>
  );
};
