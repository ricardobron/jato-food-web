import { AdminComponentPage } from './AdminComponentPage';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminComponentPage>{children}</AdminComponentPage>;
}
