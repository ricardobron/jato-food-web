import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { FinancePage } from '@/components/finance/FinancePage';

export default async function AdminFinancePage() {
  const data = await getServerSession(authOptions);

  if (data?.user.role !== 'ADMIN') {
    return redirect('/admin/login');
  }

  return (
    <main className="w-full">
      <FinancePage />
    </main>
  );
}
