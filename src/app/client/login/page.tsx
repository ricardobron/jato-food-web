import { getServerSession } from 'next-auth';
import { Flame } from 'lucide-react';

import { Logo } from '@/components/Logo';
import { LoginForm } from './LoginForm';
import { authOptions } from '@/lib/authOptions';

export default async function Login() {
  await getServerSession(authOptions);

  // if (session?.user.id) {
  //   return redirect('/client');
  // }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-ember/20 blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo className="text-3xl text-charcoal" />
        </div>

        <div className="rounded-3xl border border-charcoal/10 bg-white p-7 shadow-xl shadow-charcoal/5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flame/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-flame-600">
            <Flame className="h-3.5 w-3.5" />
            Pede num jato
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-charcoal">
            Faz já o teu pedido
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Confirma a tua mesa e começa a pedir.
          </p>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
