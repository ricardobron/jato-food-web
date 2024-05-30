'use client';
import { useSession } from 'next-auth/react';

import { IProduct, deleteProduct, getProducts } from '@/service/products';
import { useQuery } from '@tanstack/react-query';
import { Loader, Trash2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Switch } from '@/components/ui/switch';
import { ModalEditProduct } from '@/components/ModalEditProduct';
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

type AlertDialogProps = IProduct;

export const ProductsPage = () => {
  const session = useSession();

  const {
    data: products,
    isLoading,
    refetch: refetchProduct,
  } = useQuery({
    queryFn: () => getProducts(session.data?.jwt || ''),
    queryKey: ['/products'],
    enabled: !!session.data?.jwt,
  });

  if (isLoading) {
    return <Loader size={30} className="animate-spin text-orange-400" />;
  }

  function AlertDeleteDevotional(product: AlertDialogProps) {
    async function handleDeleteDevotional() {
      try {
        await deleteProduct(product.id);
        refetchProduct();
      } catch (error) {
        console.log(error);
      }
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Trash2 className="cursor-pointer" />
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white dark:bg-[#1D1D1D]">
          <AlertDialogHeader>
            <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto irá eliminar o produto <b>{product.name}</b>. <br /> Esta
              ação não pode ser revertida
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-white dark:text-black dark:hover:bg-white/70">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDevotional}
              className="bg-red-400 text-white hover:bg-red-400/45"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="w-[100%] p-12">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-[24px]">Lista de Produtos</h1>
        <ModalEditProduct />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((pr) => (
            <TableRow key={pr.id}>
              <TableCell>{pr.name}</TableCell>
              <TableCell>{pr.price}</TableCell>
              <TableCell>
                <Switch
                  className="data-[state=checked]:bg-[#FAC400] "
                  checked={pr.active}
                />
              </TableCell>
              <TableCell className="flex flex-col gap-2">
                <ModalEditProduct data={pr} />
                <AlertDeleteDevotional {...pr} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
