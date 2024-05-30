import { HeaderClient } from '@/components/HeaderClient';
import { Sidebar } from '@/components/Sidebar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col pb-8">
      <HeaderClient />
      {children}
    </div>
  );
}
