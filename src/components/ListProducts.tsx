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
    return <Loader size={30} className="animate-spin text-flame" />;
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
                  'transition-colors',
                  isActive && 'bg-flame/5'
                )}
              >
                <TableCell>
                  <p className="font-medium text-charcoal">{pr.name}</p>
                  <p className="text-sm text-charcoal/50">{pr.price}€</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row items-center gap-2">
                    <button
                      disabled={disableMinusButton}
                      onClick={() =>
                        updateProductAmount({
                          product_id: pr.id,
                          quantity: productCartQuantity - 1,
                        })
                      }
                      className="text-charcoal/60 transition-colors hover:text-flame disabled:opacity-30 disabled:hover:text-charcoal/60"
                    >
                      <MinusCircle className="h-6 w-6" />
                    </button>
                    <p className="w-5 text-center font-semibold">
                      {productCartQuantity}
                    </p>
                    <button
                      onClick={() =>
                        addProduct({
                          id: pr.id,
                          name: pr.name,
                          price: pr.price,
                          quantity: productCartQuantity + 1,
                        })
                      }
                      className="text-flame transition-transform hover:scale-110"
                    >
                      <PlusCircle className="h-6 w-6" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{subTotal}€</TableCell>
                <TableCell>
                  <button
                    disabled={!productCartQuantity}
                    onClick={() => removeProduct(pr.id)}
                  >
                    <Trash
                      className={cn(
                        'h-5 w-5 transition-colors',
                        !productCartQuantity
                          ? 'text-charcoal/20'
                          : 'text-destructive hover:text-destructive/70'
                      )}
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
