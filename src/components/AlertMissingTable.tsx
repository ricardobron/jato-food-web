import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface AlertMissingTableProps {
  open?: boolean;
  onChange?: (value: boolean) => void;
}

export function AlertMissingTable({
  open = false,
  onChange,
}: AlertMissingTableProps) {
  return (
    <AlertDialog open={open} onOpenChange={(value) => onChange?.(value)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Não tem mesa definida</AlertDialogTitle>
          <AlertDialogDescription>
            Tente scanear novamente o QRCode.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-red-300 hover:bg-red-300/50"
            onClick={() => onChange?.(false)}
          >
            Fechar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
