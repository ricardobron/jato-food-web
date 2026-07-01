import { IFinanceCashDrawer } from '@/service/finance';

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

export const CashDrawerCard = ({ drawer }: { drawer: IFinanceCashDrawer }) => {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold">Fecho de gaveta (Cash)</p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Esperado</p>
          <p className="text-lg font-semibold">{eur(drawer.expected)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Recebido</p>
          <p className="text-lg font-semibold">{eur(drawer.received)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Troco</p>
          <p className="text-lg font-semibold">{eur(drawer.change)}</p>
        </div>
      </div>
    </div>
  );
};
