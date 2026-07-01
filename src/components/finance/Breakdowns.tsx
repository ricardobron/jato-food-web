import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IFinanceAdminRow, IFinanceTableRow } from '@/service/finance';

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

export const TableBreakdown = ({ rows }: { rows: IFinanceTableRow[] }) => (
  <div className="rounded-2xl border bg-card p-4 shadow-sm">
    <p className="mb-3 text-sm font-semibold">Receita por mesa</p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mesa</TableHead>
          <TableHead className="text-right">Pedidos</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              Sem dados
            </TableCell>
          </TableRow>
        ) : (
          rows.map((t) => (
            <TableRow key={t.table_number}>
              <TableCell>Mesa {t.table_number}</TableCell>
              <TableCell className="text-right">{t.count}</TableCell>
              <TableCell className="text-right">{eur(t.revenue)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

export const AdminBreakdown = ({ rows }: { rows: IFinanceAdminRow[] }) => (
  <div className="rounded-2xl border bg-card p-4 shadow-sm">
    <p className="mb-3 text-sm font-semibold">Receita por admin</p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Admin</TableHead>
          <TableHead className="text-right">Pagamentos</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              Sem dados
            </TableCell>
          </TableRow>
        ) : (
          rows.map((a) => (
            <TableRow key={a.admin_id ?? 'none'}>
              <TableCell>{a.name}</TableCell>
              <TableCell className="text-right">{a.count}</TableCell>
              <TableCell className="text-right">{eur(a.revenue)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);
