import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';

import { redirect } from 'next/navigation';
import { ProductsPage } from './ProductsPage';

export default async function Products() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 'ADMIN') {
    return redirect('/admin/login');
  }

  return <ProductsPage />;
}
