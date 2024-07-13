import { api } from '@/lib/api';

interface ICheckPinTableRequest {
  table_number: string;
  token: string;
}

interface IShowPinTableResponse {
  pin_table: string;
}

export const showPinTable = async ({
  table_number,
  token,
}: ICheckPinTableRequest) => {
  api.defaults.headers.Authorization = `Bearer ${token}`;

  const response = await api.get<IShowPinTableResponse>('/table/showPin', {
    params: {
      table_number,
    },
  });

  return response.data;
};
