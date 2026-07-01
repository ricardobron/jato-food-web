import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';

import { Logo } from '@/components/Logo';
import ImageHome from '@/../public/img/home.png';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-cream px-6 py-12 sm:px-10">
      {/* ambient warmth — a soft ember glow bleeding from the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-flame/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-ember/20 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 sm:grid-cols-2">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <Logo className="text-3xl text-charcoal" />
            <span className="inline-flex items-center gap-1 rounded-full bg-flame/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-flame-600">
              <Flame className="h-3.5 w-3.5" />
              Pede num jato
            </span>
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-charcoal sm:text-6xl">
            A tua mesa,
            <br />
            servida{' '}
            <span className="relative whitespace-nowrap text-flame">
              num jato
              <svg
                aria-hidden
                viewBox="0 0 240 12"
                className="absolute -bottom-2 left-0 w-full text-ember"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9C60 3 180 3 238 9"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="mt-7 max-w-md text-lg text-charcoal/70">
            Nada une as pessoas como uma boa comida. Faz o pedido da mesa e
            acompanha-o a sair da cozinha — quente e a tempo.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="group inline-flex items-center justify-center gap-2 rounded-full jato-flame px-7 py-3.5 font-semibold text-white shadow-lg shadow-flame/25 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              href={'/client/login'}
            >
              Fazer pedido
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal/15 bg-white px-7 py-3.5 font-semibold text-charcoal transition-colors hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              href={'/admin/login'}
            >
              Entrar como staff
            </Link>
          </div>
        </div>

        <div className="hidden justify-center sm:flex">
          <div className="relative">
            <div className="absolute inset-0 -rotate-3 rounded-[2.5rem] bg-flame/10" />
            <Image
              src={ImageHome}
              alt="Prato pronto a servir"
              className="relative rounded-[2.5rem]"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
