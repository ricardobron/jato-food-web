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
      <div className="bg-[#FAC400] h-[98%] rounded-r-[50px] mt-2.5">
        <div className="w-full h-full  flex flex-col justify-center items-center px-4 ">
          <div className="flex flex-col items-center gap-6">
            {menus.map((menu) => (
              <Link
                className={cn(
                  'pb-2',
                  pathname === menu.route ? 'border-b-4 border-white' : ''
                )}
                key={menu.name}
                href={menu.route}
              >
                <menu.Icon className="text-white w-[25px] h-[25px] sm:w-[30px] sm:h-[30px]" />
              </Link>
            ))}

            <ModalTablePrinter />
          </div>

          {user && (
            <LogOut
              className="text-white cursor-pointer mt-6  w-[25px] h-[25px] sm:w-[30px] sm:h-[30px]"
              onClick={() => signOut()}
            />
          )}
        </div>
      </div>
    </div>
  );
};
