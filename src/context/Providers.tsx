'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { SocketContextProvider } from './SocketContext';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

import { cookies } from 'next/headers';
import { toast } from 'sonner';

interface IPropsProviders {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export const Providers = ({ children }: IPropsProviders) => {
  const router = useRouter();

  useEffect(() => {
    const axiosInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          toast.error('Sessão inválida', {
            description: 'Inicie sessão novamente',
          });
          // Redirecionar para a página de autenticação

          router.push('/client/login');
        }
        return Promise.reject(error);
      }
    );

    // Limpar o interceptor quando o componente é desmontado
    return () => {
      api.interceptors.response.eject(axiosInterceptor);
    };
  }, []); // Executar o useEffect apenas uma vez durante a inicialização

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SocketContextProvider>{children}</SocketContextProvider>
      </SessionProvider>

      <ReactQueryDevtools
        initialIsOpen={process.env.NODE_ENV === 'development'}
      />
    </QueryClientProvider>
  );
};
