import { api } from '@/lib/api';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export const getVapidPublicKey = async (token: string): Promise<string> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  const response = await api.get<{ publicKey: string }>('/push/public-key');
  return response.data.publicKey;
};

export const savePushSubscription = async (
  token: string,
  subscription: PushSubscriptionPayload
): Promise<void> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  await api.post('/push/subscribe', subscription);
};
