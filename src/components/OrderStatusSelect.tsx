'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatus, updateOrderStatus } from '@/service/order';
import { ORDER_STATUS_META } from '@/constants/orderStatus';
import { cn } from '@/lib/utils';

interface Props {
  orderId: string;
  status: OrderStatus;
}

const ORDER: OrderStatus[] = ['Preparing', 'Delivered', 'Paid'];

export const OrderStatusSelect = ({ orderId, status }: Props) => {
  const [value, setValue] = useState<OrderStatus>(status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(status);
  }, [status]);

  async function handleChange(next: string) {
    const prev = value;
    setValue(next as OrderStatus);
    setSaving(true);
    try {
      await updateOrderStatus(orderId, next as OrderStatus);
    } catch {
      setValue(prev);
      toast.error('Não foi possível mudar o estado');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger
        className={cn(
          'h-8 w-[140px] rounded-full border-2 text-xs font-semibold',
          ORDER_STATUS_META[value].border,
          ORDER_STATUS_META[value].soft
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {ORDER_STATUS_META[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
