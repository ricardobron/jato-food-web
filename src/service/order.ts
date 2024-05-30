import { api } from '@/lib/api';

export type OrderStatus = 'New' | 'ToDeliver' | 'Paid' | 'Rejected';

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

// API //

export type IFindOrders = Order & {
  order_number: number;
  order_items: {
    name: string;
    quantity: number;
    price: number;
  }[];
};

interface IProductsOrder {
  id: string;
  quantity: number;
}

interface ICreateOrder {
  products: IProductsOrder[];
  table: string;
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
