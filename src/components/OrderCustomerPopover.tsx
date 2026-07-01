'use client';

import { Info, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
  phone: string;
  table: string | number;
  createdAt: Date;
}

export const OrderCustomerPopover = ({ phone, table, createdAt }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Detalhes do cliente"
          className="text-charcoal/50 transition-colors hover:text-flame"
        >
          <Info className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 rounded-2xl border-charcoal/10">
        <p className="mb-2 font-display text-sm font-bold text-charcoal">
          Cliente
        </p>
        <div className="flex items-center gap-2 text-sm text-charcoal/70">
          <Phone className="h-4 w-4 text-flame" />
          {phone || '—'}
        </div>
        <p className="mt-2 text-xs text-charcoal/50">
          Mesa {table} · {format(createdAt, 'PP, HH:mm', { locale: pt })}
        </p>
      </PopoverContent>
    </Popover>
  );
};
