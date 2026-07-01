import { OrderStatus } from '@/service/order';

/**
 * Single source of truth for how each order status looks across the app —
 * filter chips, card spine, and action buttons all read from here so the
 * Jato palette stays consistent.
 */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    /** solid fill (chips, card spine) */
    solid: string;
    /** soft tint + text (badges, idle buttons) */
    soft: string;
    /** border color */
    border: string;
    /** hex for non-tailwind consumers (e.g. SweetAlert) */
    hex: string;
  }
> = {
  Preparing: {
    label: 'A preparar',
    solid: 'bg-status-preparing text-charcoal',
    soft: 'bg-status-preparing/10 text-status-preparing',
    border: 'border-status-preparing',
    hex: '#F6A609',
  },
  Delivered: {
    label: 'Entregue',
    solid: 'bg-status-delivered text-white',
    soft: 'bg-status-delivered/10 text-status-delivered',
    border: 'border-status-delivered',
    hex: '#2563EB',
  },
  Paid: {
    label: 'Pago',
    solid: 'bg-status-paid text-white',
    soft: 'bg-status-paid/10 text-status-paid',
    border: 'border-status-paid',
    hex: '#16A34A',
  },
};
