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
            className="jato-flame rounded-full font-semibold text-white"
            onClick={() => keepCart?.(true)}
          >
            Manter
          </AlertDialogAction>
          <AlertDialogCancel
            className="rounded-full"
            onClick={() => keepCart?.(false)}
          >
            Descartar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
