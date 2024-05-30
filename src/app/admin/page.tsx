import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { Order } from '@/components/Order';

export default async function AdminPage() {
  const data = await getServerSession(authOptions);

  if (data?.user.role !== 'ADMIN') {
    return redirect('/admin/login');
  }

  return (
    <main className="w-full">
      <Order />
    </main>
  );
}
