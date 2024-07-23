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
}

export interface IOrderItemComponent extends IOrderItem {
  loading?: boolean;
}

export type IFindOrders = Order & {
  order_number: number;
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
