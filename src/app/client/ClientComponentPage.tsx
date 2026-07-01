'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

import { useGeneral } from '@/store/general';
import { NewOrder } from '@/components/NewOrder';
import { Order } from '@/components/Order';
import { NotificationNoticeModal } from '@/components/NotificationNoticeModal';
import { ensurePushSubscription } from '@/lib/pushSubscription';

export const ClientComponentPage = () => {
  const { buttonOption } = useGeneral();
  const session = useSession();
  const jwt = session.data?.jwt;
  const isAdmin = session.data?.user?.role === 'ADMIN';

  useEffect(() => {
    if (jwt && !isAdmin) {
      ensurePushSubscription(jwt);
    }
  }, [jwt, isAdmin]);

  return (
    <>
      <NotificationNoticeModal />
      {buttonOption === 'my_orders' ? <Order /> : <NewOrder />}
    </>
  );
};
