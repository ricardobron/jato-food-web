import type { Metadata, Viewport } from 'next';

import { Inter, Sora } from 'next/font/google';
import './globals.css';

import { Providers } from '@/context/Providers';
import { Toaster } from '@/components/ui/sonner';

import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jato · Pede num jato',
  description: 'Jato — pedidos de comida à mesa, rápidos como um jato.',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'JATO',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

import 'react-perfect-scrollbar/dist/css/styles.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={cn(
          'antialiased font-sans',
          inter.variable,
          sora.variable
        )}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
