'use client';

import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { IButtonOption, useGeneral } from '@/store/general';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AlertProductsOnCart } from './AlertProductsOnCart';
import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export const HeaderClient = () => {
  const { data: user } = useSession();
  const pathname = usePathname();
  const isPageLogin = pathname.includes('/client/login');

  const [showAlertProductsOnCart, setShowAlertProductsOnCart] = useState(false);

  const { cart, clearCart } = useCart();

  const { buttonOption, handleChangeButtonOption } = useGeneral();

  function changeInternalButtonOption(button_option: IButtonOption) {
    if (cart.length > 0 && button_option === 'my_orders') {
      setShowAlertProductsOnCart(true);
      return;
    }

    handleChangeButtonOption(button_option);
  }

  function handleKeepCart(keepCart: boolean) {
    if (keepCart) {
      setShowAlertProductsOnCart(false);

      return;
    }

    setShowAlertProductsOnCart(false);
    clearCart();
    handleChangeButtonOption('my_orders');
  }

  const styleButtonSelected = (button_option: IButtonOption) =>
    buttonOption === button_option ? 'bg-[#FABF35] text-black rounded-lg' : '';

  if (isPageLogin) return null;

  return (
    <div className="p-4 bg-black flex justify-center items-center flex-col rounded-b-[50px]">
      <div className="w-full flex justify-center items-center">
        <h1 className="text-[24px] text-center text-white font-medium flex-1 ">
          Pedidos
        </h1>
        {user && (
          <LogOut
            className="text-white cursor-pointer  w-[25px] h-[25px] sm:w-[30px] sm:h-[30px]"
            onClick={() => signOut()}
          />
        )}
      </div>

      <div className="flex justify-center gap-4 bg-white p-2 rounded-lg mt-2">
        <button
          onClick={() => changeInternalButtonOption('my_orders')}
          className={cn('p-2 font-medium', styleButtonSelected('my_orders'))}
        >
          Meus Pedidos
        </button>
        <button
          onClick={() => changeInternalButtonOption('new_order')}
          className={cn('p-2 font-medium', styleButtonSelected('new_order'))}
        >
          Novo Pedido
        </button>
      </div>

      <AlertProductsOnCart
        keepCart={handleKeepCart}
        open={showAlertProductsOnCart}
      />
    </div>
  );
};
