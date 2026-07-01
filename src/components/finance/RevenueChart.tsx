'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { IFinanceSeriesPoint } from '@/service/finance';

const config: ChartConfig = {
  revenue: { label: 'Receita', color: 'hsl(var(--primary))' },
};

const tick = (bucket: 'hour' | 'day') => (value: string) =>
  bucket === 'hour' ? value.slice(11, 16) : value.slice(5); // HH:00 ou MM-DD

export const RevenueChart = ({
  series,
  bucket,
}: {
  series: IFinanceSeriesPoint[];
  bucket: 'hour' | 'day';
}) => {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold">Receita ao longo do tempo</p>
      <ChartContainer config={config} className="mt-3 h-[240px] w-full">
        <BarChart data={series} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="bucket"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
            tickFormatter={tick(bucket)}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
