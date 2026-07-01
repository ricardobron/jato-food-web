import { api } from '@/lib/api';

export interface IFinanceRange {
  from: string;
  to: string;
  bucket: 'hour' | 'day';
}

export interface IFinanceKpis {
  revenue: number;
  count: number;
  averageTicket: number;
  cash: { amount: number; count: number };
  online: { amount: number; count: number };
}

export interface IFinanceSeriesPoint {
  bucket: string;
  revenue: number;
}

export interface IFinanceProductRow {
  product_id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface IFinanceTableRow {
  table_number: number;
  revenue: number;
  count: number;
}

export interface IFinanceAdminRow {
  admin_id: string | null;
  name: string;
  revenue: number;
  count: number;
}

export interface IFinanceCashDrawer {
  expected: number;
  received: number;
  change: number;
}

export interface IFinanceSummary {
  range: IFinanceRange;
  kpis: IFinanceKpis;
  series: IFinanceSeriesPoint[];
  products: IFinanceProductRow[];
  byTable: IFinanceTableRow[];
  byAdmin: IFinanceAdminRow[];
  cashDrawer: IFinanceCashDrawer;
}

export const getFinanceSummary = async (
  token: string,
  params?: { from?: string; to?: string }
): Promise<IFinanceSummary> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  const response = await api.get<IFinanceSummary>('/finance/summary', {
    params,
  });
  return response.data;
};
