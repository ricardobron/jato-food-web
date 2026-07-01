import { IFinanceSummary } from '@/service/finance';

const eur = (n: number) => n.toFixed(2).replace('.', ',');

function line(cells: (string | number)[]): string {
  return cells
    .map((c) => {
      const s = String(c);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(';');
}

export function buildFinanceCsv(summary: IFinanceSummary): string {
  const { range, kpis, products, byTable, byAdmin, cashDrawer } = summary;
  const rows: string[] = [];

  rows.push(line(['Período', range.from, range.to]));
  rows.push('');

  rows.push(line(['KPIs']));
  rows.push(line(['Receita total', eur(kpis.revenue)]));
  rows.push(line(['Nº pagamentos', kpis.count]));
  rows.push(line(['Ticket médio', eur(kpis.averageTicket)]));
  rows.push(line(['Cash', eur(kpis.cash.amount), kpis.cash.count]));
  rows.push(line(['Online', eur(kpis.online.amount), kpis.online.count]));
  rows.push('');

  rows.push(line(['Fecho de gaveta (Cash)']));
  rows.push(line(['Esperado', eur(cashDrawer.expected)]));
  rows.push(line(['Recebido', eur(cashDrawer.received)]));
  rows.push(line(['Troco', eur(cashDrawer.change)]));
  rows.push('');

  rows.push(line(['Produtos', 'Qtd', 'Valor']));
  for (const p of products) rows.push(line([p.name, p.quantity, eur(p.revenue)]));
  rows.push('');

  rows.push(line(['Mesa', 'Pedidos', 'Valor']));
  for (const t of byTable) rows.push(line([t.table_number, t.count, eur(t.revenue)]));
  rows.push('');

  rows.push(line(['Admin', 'Pagamentos', 'Valor']));
  for (const a of byAdmin) rows.push(line([a.name, a.count, eur(a.revenue)]));

  return rows.join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
