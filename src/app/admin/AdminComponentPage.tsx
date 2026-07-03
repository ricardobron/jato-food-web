'use client';

import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

import PerfectScrollbar from 'react-perfect-scrollbar';
import { useKeepAliveRunner } from '@/hooks/useKeepAliveRunner';

interface IAdminComponentPageProps {
  children: React.ReactNode;
}

export const AdminComponentPage = ({ children }: IAdminComponentPageProps) => {
  const pathname = usePathname();

  // Corre o loop de keep-alive enquanto o toggle na sidebar estiver ligado.
  useKeepAliveRunner();

  const isPageLogin = pathname.includes('admin/login');

  return (
    <div
      className={`grid ${
        isPageLogin ? '' : 'grid-cols-[50px_1fr] sm:grid-cols-[100px_1fr]'
      } relative`}
    >
      <Sidebar />
      <PerfectScrollbar style={{ height: '95vh' }}>{children}</PerfectScrollbar>
    </div>
  );
};
