import { api } from '@/lib/api';

export interface IProduct {
  id: string;
  name: string;
  price: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateProduct {
  name: string;
  price: number;
  active: boolean;
}

export type IUpdateProduct = Partial<ICreateProduct> & {
  id: string;
};

export const getProducts = async (token: string) => {
  api.defaults.headers.Authorization = `Bearer ${token}`;

  const response = await api.get<IProduct[]>('/product');

  return response.data;
};

export const createProduct = async (data: ICreateProduct) => {
  await api.post('/product', data);
};

export const updateProduct = async (data: IUpdateProduct) => {
  await api.put(`/product/${data.id}`, data);
};

export const deleteProduct = async (id: string) => {
  await api.delete(`/product/${id}`);
};
