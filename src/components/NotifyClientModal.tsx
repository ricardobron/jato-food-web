'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Loader, Send } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendNotification } from '@/service/notification';

const PRESETS = [
  'O seu pedido está pronto 🍔',
  'O seu pedido já vai a caminho',
  'Pode levantar o pedido ao balcão',
];

const MAX = 300;

interface Props {
  order: { id: string; order_number: number };
}

export const NotifyClientModal = ({ order }: Props) => {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setMessage('');
    setLoading(false);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const onSend = async () => {
    const jwt = session.data?.jwt;
    const text = message.trim();
    if (!jwt || !text) return;
    setLoading(true);
    try {
      await sendNotification(jwt, { order_id: order.id, message: text });
      toast.success(`Notificação enviada ao cliente do pedido #${order.order_number}`);
      onOpenChange(false);
    } catch {
      toast.error('Não foi possível enviar a notificação');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
        >
          <Send className="h-3.5 w-3.5" /> Notificar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificar cliente — Pedido #{order.order_number}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setMessage(p)}
              className="rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/70 transition-colors hover:bg-charcoal/5"
            >
              {p}
            </button>
          ))}
        </div>

        <Textarea
          value={message}
          maxLength={MAX}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva uma mensagem para o cliente…"
          rows={4}
        />
        <p className="text-right text-xs text-charcoal/45">
          {message.length}/{MAX}
        </p>

        <DialogFooter>
          <Button
            type="button"
            onClick={onSend}
            disabled={loading || message.trim().length === 0}
            className="gap-1.5"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
