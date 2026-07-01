'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Download, Loader, Printer } from 'lucide-react';

import { useSocket } from '@/context/SocketContext';
import { getFinanceSummary, IFinanceSummary } from '@/service/finance';
import { buildFinanceCsv, downloadCsv } from '@/lib/financeExport';
import { Button } from '@/components/ui/button';
import {
  PeriodSelector,
  Period,
} from '@/components/finance/PeriodSelector';
import { KpiCards } from '@/components/finance/KpiCards';
import { CashDrawerCard } from '@/components/finance/CashDrawerCard';
import { RevenueChart } from '@/components/finance/RevenueChart';
import { ProductsTable } from '@/components/finance/ProductsTable';
import { TableBreakdown, AdminBreakdown } from '@/components/finance/Breakdowns';

export const FinancePage = () => {
  const session = useSession();
  const { socket } = useSocket();

  const [period, setPeriod] = useState<Period>({ label: 'Hoje' });
  const [summary, setSummary] = useState<IFinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const periodRef = useRef(period);
  periodRef.current = period;

  const reqIdRef = useRef(0);

  const load = useCallback(
    async (p: Period) => {
      const jwt = session.data?.jwt;
      if (!jwt) return;
      const myId = ++reqIdRef.current;
      try {
        const data = await getFinanceSummary(jwt, { from: p.from, to: p.to });
        if (myId === reqIdRef.current) setSummary(data);
      } catch {
        toast.error('Falha ao carregar dados financeiros');
      } finally {
        if (myId === reqIdRef.current) setIsLoading(false);
      }
    },
    [session.data?.jwt]
  );

  // carrega ao mudar período ou ao ter token
  useEffect(() => {
    setIsLoading(true);
    load(period);
  }, [load, period]);

  // refetch em tempo real quando entra pagamento (debounce)
  useEffect(() => {
    if (!socket) return;
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => load(periodRef.current), 500);
    };
    socket.on('payment_created', handler);
    return () => {
      clearTimeout(timer);
      socket.off('payment_created', handler);
    };
  }, [socket, load]);

  const onExportCsv = () => {
    if (!summary) return;
    downloadCsv(`financeiro-${summary.range.from.slice(0, 10)}.csv`, buildFinanceCsv(summary));
  };

  if (isLoading && !summary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!summary) {
    return <div className="p-6 text-muted-foreground">Sem dados.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Financeiro</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportCsv}>
            <Download className="mr-1 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" /> Imprimir/PDF
          </Button>
        </div>
      </div>

      <PeriodSelector value={period} onChange={setPeriod} />

      <div id="finance-print" className="space-y-4">
        <KpiCards kpis={summary.kpis} />
        <RevenueChart series={summary.series} bucket={summary.range.bucket} />
        <div className="grid gap-4 lg:grid-cols-2">
          <ProductsTable products={summary.products} />
          <div className="space-y-4">
            <CashDrawerCard drawer={summary.cashDrawer} />
            <TableBreakdown rows={summary.byTable} />
            <AdminBreakdown rows={summary.byAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
};
