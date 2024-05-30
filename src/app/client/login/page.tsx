import { getServerSession } from 'next-auth';
import { LoginForm } from './LoginForm';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function Login() {
  const session = await getServerSession(authOptions);

  // if (session?.user.id) {
  //   return redirect('/client');
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col justify-center items-center  bg-[#F2F2F2] w-[300px] h-full p-4 rounded-[20px]">
        <h1 className="font-semibold font-Roboto text-[19px]">
          Faz já o teu pedido
        </h1>

        <div className="mt-6 space-y-5">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
