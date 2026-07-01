'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { primeAudio } from '@/lib/notificationFeedback';

const STORAGE_KEY = 'jato_notif_notice_v1';

export const NotificationNoticeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // localStorage indisponível → não mostra
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const enable = async () => {
    primeAudio();
    try {
      if (typeof Notification !== 'undefined') {
        await Notification.requestPermission();
      }
    } catch {
      // ignore
    }
    dismiss();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-flame" />
            Esta aplicação envia-lhe notificações
          </DialogTitle>
          <DialogDescription>
            Enviamos-lhe avisos sobre o estado do seu pedido (por exemplo, quando
            está pronto ou a caminho). Ative as notificações para não perder
            nenhuma.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-charcoal/5 p-3 text-xs leading-relaxed text-charcoal/70">
          <p className="mb-1 font-semibold text-charcoal/80">
            Informação adicional (RGPD)
          </p>
          Ao ativar as notificações, autoriza o JATO a enviar-lhe avisos
          relativos ao seu pedido. As notificações não são usadas para
          publicidade. Os dados associados ao seu pedido são tratados apenas para
          a gestão do serviço, ao abrigo do Regulamento Geral de Proteção de
          Dados (RGPD). Pode desativar as notificações a qualquer momento nas
          definições do seu navegador.
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={dismiss}>
            Agora não
          </Button>
          <Button type="button" onClick={enable}>
            Ativar notificações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
