'use client';

import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { IButtonOption, useGeneral } from '@/store/general';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AlertProductsOnCart } from './AlertProductsOnCart';
import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { NotificationBell } from './NotificationBell';

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
    buttonOption === button_option
      ? 'jato-flame text-white shadow-md shadow-flame/30'
      : 'text-charcoal/60 hover:text-charcoal';

  if (isPageLogin) return null;

  return (
    <div className="flex flex-col items-center justify-center rounded-b-[40px] bg-charcoal p-5">
      <div className="flex w-full items-center justify-between">
        <Logo className="text-xl text-cream" />
        <h1 className="flex-1 text-center font-display text-xl font-bold text-cream">
          Pedidos
        </h1>
        {user ? (
          <div className="flex items-center gap-3">
            {user.user.role !== 'ADMIN' && <NotificationBell />}
            <button
              onClick={() => signOut()}
              title="Terminar sessão"
              className="text-cream/70 transition-colors hover:text-cream"
            >
              <LogOut className="h-[24px] w-[24px] sm:h-[26px] sm:w-[26px]" />
            </button>
          </div>
        ) : (
          <span className="w-[26px]" />
        )}
      </div>

      <div className="mt-4 flex justify-center gap-1 rounded-full bg-white p-1">
        <button
          onClick={() => changeInternalButtonOption('my_orders')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
            styleButtonSelected('my_orders')
          )}
        >
          Meus Pedidos
        </button>
        <button
          onClick={() => changeInternalButtonOption('new_order')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
            styleButtonSelected('new_order')
          )}
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
