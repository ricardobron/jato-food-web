import { IFinanceKpis } from '@/service/finance';

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
const pct = (part: number, total: number) =>
  total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`;

const Card = ({ title, value, hint }: { title: string; value: string; hint?: string }) => (
  <div className="rounded-2xl border bg-card p-4 shadow-sm">
    <p className="text-xs font-medium text-muted-foreground">{title}</p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
    {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);

export const KpiCards = ({ kpis }: { kpis: IFinanceKpis }) => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card title="Receita total" value={eur(kpis.revenue)} />
      <Card title="Nº pagamentos" value={String(kpis.count)} />
      <Card title="Ticket médio" value={eur(kpis.averageTicket)} />
      <Card
        title="Cash / Online"
        value={`${eur(kpis.cash.amount)} · ${eur(kpis.online.amount)}`}
        hint={`${pct(kpis.cash.amount, kpis.revenue)} cash · ${pct(
          kpis.online.amount,
          kpis.revenue
        )} online`}
      />
    </div>
  );
};
