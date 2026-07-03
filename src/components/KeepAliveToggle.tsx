'use client';

import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { useKeepAlive } from '@/store/keepAlive';
import { cn } from '@/lib/utils';

export const KeepAliveToggle = () => {
  const enabled = useKeepAlive((s) => s.enabled);
  const status = useKeepAlive((s) => s.status);
  const toggle = useKeepAlive((s) => s.toggle);

  // Evita mismatch de hidratação: o valor persistido só existe no cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && enabled;

  const title = active
    ? 'Manter servidor acordado: LIGADO — clica para desligar'
    : 'Manter servidor acordado: desligado — clica para ligar';

  return (
    <button
      type="button"
      onClick={toggle}
      title={title}
      aria-pressed={active}
      aria-label={title}
      className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors sm:h-12 sm:w-12',
        active
          ? 'jato-flame text-white shadow-lg shadow-flame/30'
          : 'text-cream/60 hover:bg-white/10 hover:text-cream'
      )}
    >
      <Radio className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]" />

      {active && (
        <span
          className={cn(
            'absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-charcoal',
            status === 'unreachable' ? 'bg-yellow-400' : 'bg-green-400',
            status === 'pinging' && 'animate-pulse'
          )}
        />
      )}
    </button>
  );
};
