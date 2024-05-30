import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertMissingTableProps {
  open: boolean;
  keepCart?: (value: boolean) => void;
}

export function AlertProductsOnCart({
  open = false,
  keepCart,
}: AlertMissingTableProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem produtos no carrinho</AlertDialogTitle>
          <AlertDialogDescription>
            Quer manter os produtos no carrinho?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-wrap gap-2">
          <AlertDialogAction
            className="bg-[#87B6A1] hover:bg-[#87B6A1]/50"
            onClick={() => keepCart?.(true)}
          >
            Sim
          </AlertDialogAction>
          <AlertDialogCancel
            className="bg-red-400 text-white hover:bg-red-400/50"
            onClick={() => keepCart?.(false)}
          >
            Não
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
