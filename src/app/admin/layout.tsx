import { AdminComponentPage } from './AdminComponentPage';

export default function RootLayout({
  children,
  ...rest
}: Readonly<{
  children: React.ReactNode;
  props: any;
}>) {
  return <AdminComponentPage>{children}</AdminComponentPage>;
}
