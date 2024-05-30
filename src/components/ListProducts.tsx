'use client';

import { Loader, MinusCircle, PlusCircle, Trash } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/service/products';
import { useSession } from 'next-auth/react';

export const ListProducts = () => {
  const session = useSession();

  const { addProduct, cart, removeProduct, updateProductAmount } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryFn: () => getProducts(session.data?.jwt || ''),
    queryKey: ['/products'],
    enabled: !!session.data?.jwt,
  });

  if (isLoading) {
    return <Loader size={30} className="animate-spin text-orange-400" />;
  }

  return (
    <div className="w-[100%] sm:w-[50%] px-4 overflow-y-scroll h-[calc(100vh-370px)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Qtd</TableHead>
            <TableHead>SubTotal</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((pr) => {
            const productCart = cart.find((c) => c.id === pr.id);
            const productCartQuantity = productCart?.quantity || 0;
            const disableMinusButton = productCartQuantity < 1;
            const isActive = productCartQuantity > 0;

            const subTotal = (pr.price * productCartQuantity).toFixed(2);

            return (
              <TableRow
                key={pr.id}
                className={cn(
                  isActive ? 'border-b-2 border-b-[#FABF35] transition-all' : ''
                )}
              >
                <TableCell className="">
                  <p>{pr.name}</p>
                  <p> {pr.price}€</p>
                </TableCell>
                <TableCell className="flex flex-row items-center gap-2">
                  <button
                    disabled={disableMinusButton}
                    onClick={() =>
                      updateProductAmount({
                        product_id: pr.id,
                        quantity: productCartQuantity - 1,
                      })
                    }
                  >
                    <MinusCircle />
                  </button>
                  <p>{productCartQuantity}</p>
                  <button
                    onClick={() =>
                      addProduct({
                        id: pr.id,
                        name: pr.name,
                        price: pr.price,
                        quantity: productCartQuantity + 1,
                      })
                    }
                  >
                    <PlusCircle />
                  </button>
                </TableCell>
                <TableCell>{subTotal}€</TableCell>
                <TableCell>
                  <button
                    disabled={!productCartQuantity}
                    onClick={() => removeProduct(pr.id)}
                  >
                    <Trash
                      className={cn(!productCartQuantity ? '' : 'text-red-400')}
                    />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
