import type { Metadata } from 'next';

import { Inter } from 'next/font/google';
import './globals.css';

import { Providers } from '@/context/Providers';
import { Toaster } from '@/components/ui/sonner';

import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jato',
  description: 'Jato application to control order food',
};

import 'react-perfect-scrollbar/dist/css/styles.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={cn('antialiased', inter.className)}>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
