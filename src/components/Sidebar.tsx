'use client';

import Link from 'next/link';
import { Home, LogOut, Package } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModalTablePrinter } from './ModalTablePrinter';

export const Sidebar = () => {
  const session = useSession();
  const pathname = usePathname();
  const user = session.data?.user;

  const menus = [
    { name: 'Home', route: '/admin', Icon: Home },
    { name: 'Produtos', route: '/admin/products', Icon: Package },
  ];

  const isPageLogin = pathname.includes('admin/login');

  if (isPageLogin) return null;

  return (
    <div className="h-screen">
      <div className="mt-2.5 h-[98%] rounded-r-[40px] bg-charcoal">
        <div className="flex h-full w-full flex-col items-center justify-between px-4 py-8">
          <Link href="/admin" className="jato-wordmark text-xl text-cream">
            J
            <span className="text-flame">A</span>
          </Link>

          <div className="flex flex-col items-center gap-3">
            {menus.map((menu) => {
              const isActive = pathname === menu.route;
              return (
                <Link
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl transition-colors sm:h-12 sm:w-12',
                    isActive
                      ? 'jato-flame text-white shadow-lg shadow-flame/30'
                      : 'text-cream/60 hover:bg-white/10 hover:text-cream'
                  )}
                  key={menu.name}
                  href={menu.route}
                  title={menu.name}
                >
                  <menu.Icon className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]" />
                </Link>
              );
            })}

            <div className="text-cream/70">
              <ModalTablePrinter />
            </div>
          </div>

          {user ? (
            <button
              onClick={() => signOut()}
              title="Terminar sessão"
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <LogOut className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]" />
            </button>
          ) : (
            <span className="h-11 w-11" />
          )}
        </div>
      </div>
    </div>
  );
};
