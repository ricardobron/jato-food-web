import Link from 'next/link';

import { Logo } from '@/components/Logo';
import { LoginForm } from './LoginForm';

export default async function Login() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-flame/15 blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block">
            <Logo className="text-3xl text-charcoal" />
          </Link>
        </div>

        <div className="rounded-3xl border border-charcoal/10 bg-white p-7 shadow-xl shadow-charcoal/5">
          <span className="text-xs font-semibold uppercase tracking-wide text-flame">
            Área de staff
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-charcoal">
            Entrar no painel
          </h1>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
