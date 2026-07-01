'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { IFinanceProductRow } from '@/service/finance';

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

export const ProductsTable = ({ products }: { products: IFinanceProductRow[] }) => {
  const [hideUnsold, setHideUnsold] = useState(false);

  const rows = hideUnsold ? products.filter((p) => p.quantity > 0) : products;
  const totalQty = rows.reduce((a, p) => a + p.quantity, 0);
  const totalRevenue = rows.reduce((a, p) => a + p.revenue, 0);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Produtos</p>
        <div className="no-print flex items-center gap-2">
          <Switch id="hide-unsold" checked={hideUnsold} onCheckedChange={setHideUnsold} />
          <Label htmlFor="hide-unsold" className="text-xs text-muted-foreground">
            Esconder não vendidos
          </Label>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Qtd</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.product_id} className={p.quantity === 0 ? 'text-muted-foreground' : ''}>
              <TableCell>{p.name}</TableCell>
              <TableCell className="text-right">{p.quantity}</TableCell>
              <TableCell className="text-right">{eur(p.revenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{totalQty}</TableCell>
            <TableCell className="text-right">{eur(totalRevenue)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
