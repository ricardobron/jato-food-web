import { api } from '@/lib/api';

export interface INotification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
  order_number: number;
}

export const sendNotification = async (
  token: string,
  data: { order_id: string; message: string }
): Promise<void> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  await api.post('/notification', data);
};

export const getNotifications = async (
  token: string
): Promise<INotification[]> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  const response = await api.get<INotification[]>('/notification');
  return response.data;
};

export const markNotificationsRead = async (token: string): Promise<void> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  await api.patch('/notification/read');
};
