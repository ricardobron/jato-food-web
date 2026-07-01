import { api } from '@/lib/api';

export type OrderStatus = 'Paid' | 'Delivered' | 'Preparing';

type Order = {
  id: string;
  table: string;
  total: number;
  user_id: string;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
};

// SOCKET //

export type ICreatedOrderSocket = IFindOrders;

export interface ISockeUpdateOrderItem {
  order_id: string;
  order_item_id: string;
  checked: boolean;
}

export interface ISockeOrderItemUpdated {
  id: string;
  order_id: string;
  product_id: string;
  price: number;
  quantity: number;
  checked: boolean;
  created_at: Date;
  updated_at: Date;
}

// API //

export interface IOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  checked: boolean;
  paid: boolean;
}

export interface IOrderItemComponent extends IOrderItem {
  loading?: boolean;
}

export type IFindOrders = Order & {
  order_number: number;
  phone_number: string;
  order_items: IOrderItem[];
};

interface IProductsOrder {
  id: string;
  quantity: number;
}

interface ICreateOrder {
  products: IProductsOrder[];
  table_number: string;
}

interface IUpdateOrder {
  order_id: string;
  status: OrderStatus;
}

export const getOrders = async (token: string) => {
  api.defaults.headers.Authorization = `Bearer ${token}`;

  const response = await api.get<IFindOrders[]>('/order');

  return response.data;
};

export const createOrder = async (data: ICreateOrder) => {
  await api.post('/order', data);
};

export const updateOrder = async (data: IUpdateOrder) => {
  await api.put(`/order/${data.order_id}`, { status: data.status });
};

interface IProductInput {
  id: string;
  quantity: number;
}

export const createOrderAdmin = async (data: {
  table_number: string;
  phone_number: string;
  products: IProductInput[];
}) => {
  await api.post('/order/admin', data);
};

export const updateOrderItems = async (
  order_id: string,
  products: IProductInput[]
) => {
  await api.patch(`/order/${order_id}/items`, { products });
};

export const updateOrderStatus = async (
  order_id: string,
  status: OrderStatus
) => {
  await api.patch(`/order/${order_id}/status`, { status });
};

export interface IPaymentGroupItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  paid: boolean;
}

export interface IPaymentGroupOrder {
  id: string;
  order_number: number;
  table: number;
  status: OrderStatus;
  items: IPaymentGroupItem[];
}

export interface IPaymentGroup {
  phone_number: string;
  outstanding_total: number;
  orders: IPaymentGroupOrder[];
}

export const getPaymentGroup = async (
  orderId: string
): Promise<IPaymentGroup> => {
  const response = await api.get<IPaymentGroup>(
    `/order/${orderId}/payment-group`
  );
  return response.data;
};

export const createPayment = async (data: {
  order_item_ids: string[];
  mode: 'Cash' | 'Online';
  received?: number;
}): Promise<{ amount: number; change: number | null }> => {
  const response = await api.post<{ amount: number; change: number | null }>(
    '/order/payment',
    data
  );
  return response.data;
};
