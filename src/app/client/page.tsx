import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { ClientComponentPage } from './ClientComponentPage';

export default async function ClientPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return redirect('/client/login');
  }

  if (session?.user.role === 'ADMIN') {
    return redirect('/admin');
  }

  return (
    <main className="flex flex-col  pt-4">
      <ClientComponentPage />
    </main>
  );
}
