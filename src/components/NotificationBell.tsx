'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSocket } from '@/context/SocketContext';
import {
  INotification,
  getNotifications,
  markNotificationsRead,
} from '@/service/notification';
import { notificationFeedback, primeAudio } from '@/lib/notificationFeedback';
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  hasActivePushSubscription,
} from '@/lib/pushSubscription';
import { Button } from '@/components/ui/button';

interface SocketNotification {
  id: string;
  message: string;
  order_id: string;
  order_number: number;
  created_at: string;
}

export const NotificationBell = () => {
  const session = useSession();
  const { socket } = useSocket();

  const [items, setItems] = useState<INotification[]>([]);
  const [unread, setUnread] = useState(0);

  type PushState = 'loading' | 'enabled' | 'disabled' | 'blocked' | 'unsupported';
  const [pushState, setPushState] = useState<PushState>('loading');

  const jwt = session.data?.jwt;

  const refreshPushState = useCallback(async () => {
    if (!isPushSupported()) {
      setPushState('unsupported');
      return;
    }
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'denied'
    ) {
      setPushState('blocked');
      return;
    }
    const active = await hasActivePushSubscription();
    setPushState(active ? 'enabled' : 'disabled');
  }, []);

  const handleEnablePush = useCallback(async () => {
    setPushState('loading');
    primeAudio();
    try {
      if (typeof Notification !== 'undefined') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && jwt) {
          await subscribeToPush(jwt);
        }
      }
      toast('Notificações ativadas');
    } catch {
      // ignore
    }
    await refreshPushState();
  }, [jwt, refreshPushState]);

  const handleDisablePush = useCallback(async () => {
    setPushState('loading');
    if (jwt) {
      await unsubscribeFromPush(jwt);
    }
    toast('Notificações desativadas');
    await refreshPushState();
  }, [jwt, refreshPushState]);

  // carregar ao ter token
  useEffect(() => {
    if (!jwt) return;
    getNotifications(jwt)
      .then((data) => {
        setItems(data);
        setUnread(data.filter((n) => !n.read).length);
      })
      .catch(() => {});
  }, [jwt]);

  // ativar áudio no primeiro gesto do utilizador (política de autoplay)
  useEffect(() => {
    const prime = () => primeAudio();
    window.addEventListener('pointerdown', prime, { once: true });
    return () => window.removeEventListener('pointerdown', prime);
  }, []);

  // socket: nova notificação
  useEffect(() => {
    if (!socket) return;
    const handler = (data: SocketNotification) => {
      setItems((prev) => [
        {
          id: data.id,
          message: data.message,
          read: false,
          created_at: data.created_at,
          order_number: data.order_number,
        },
        ...prev,
      ]);
      setUnread((u) => u + 1);
      toast(data.message, { closeButton: true });
      notificationFeedback();
    };
    socket.on('client_notification', handler);
    return () => {
      socket.off('client_notification', handler);
    };
  }, [socket]);

  useEffect(() => {
    refreshPushState();
  }, [refreshPushState]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        refreshPushState();
        if (unread > 0 && jwt) {
          setUnread(0);
          setItems((prev) => prev.map((n) => ({ ...n, read: true })));
          markNotificationsRead(jwt).catch(() => {});
        }
      }
    },
    [unread, jwt, refreshPushState]
  );

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Notificações"
          className="relative text-cream/70 transition-colors hover:text-cream"
        >
          <Bell className="h-[24px] w-[24px] sm:h-[26px] sm:w-[26px]" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-flame px-1 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-2.5 text-sm font-semibold">
          Notificações
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Sem notificações
            </p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className="border-b px-4 py-3 last:border-b-0"
              >
                <p className="text-sm text-charcoal">{n.message}</p>
                <p className="mt-1 text-xs text-charcoal/45">
                  Pedido #{n.order_number} ·{' '}
                  {new Date(n.created_at).toLocaleString('pt-PT', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
        {pushState !== 'unsupported' && (
          <div className="border-t px-4 py-3">
            {pushState === 'enabled' && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-charcoal/60">
                  Notificações ativadas
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDisablePush}
                >
                  Desativar
                </Button>
              </div>
            )}
            {pushState === 'disabled' && (
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={handleEnablePush}
              >
                Ativar notificações
              </Button>
            )}
            {pushState === 'blocked' && (
              <p className="text-xs leading-relaxed text-charcoal/50">
                Notificações bloqueadas. Reativa-as nas definições do navegador.
              </p>
            )}
            {pushState === 'loading' && (
              <p className="text-center text-xs text-charcoal/40">A carregar…</p>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
