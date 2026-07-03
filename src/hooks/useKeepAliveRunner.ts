'use client';

import { useEffect, useRef } from 'react';
import { useKeepAlive } from '@/store/keepAlive';
import { KEEP_ALIVE_INTERVAL_MS, pingBackend } from '@/lib/keepAlive';

/**
 * Corre o loop de keep-alive enquanto o toggle estiver ligado.
 * Deve ser montado UMA única vez na árvore (ex.: no layout admin).
 */
export function useKeepAliveRunner() {
  const enabled = useKeepAlive((s) => s.enabled);
  const setStatus = useKeepAlive((s) => s.setStatus);
  const setLastPingAt = useKeepAlive((s) => s.setLastPingAt);

  // Evita pings sobrepostos se o anterior ainda estiver em curso (cold start).
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    let cancelled = false;

    const runPing = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      setStatus('pinging');

      const result = await pingBackend();

      inFlight.current = false;
      if (cancelled) return;

      setStatus(result);
      setLastPingAt(Date.now());
    };

    // Ping imediato ao ligar.
    runPing();

    const interval = setInterval(runPing, KEEP_ALIVE_INTERVAL_MS);

    // Abas em background podem atrasar timers. Ao voltar a ficar visível,
    // se já passou o intervalo, pingamos logo para não deixar hibernar.
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const last = useKeepAlive.getState().lastPingAt ?? 0;
      if (Date.now() - last >= KEEP_ALIVE_INTERVAL_MS) runPing();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, setStatus, setLastPingAt]);
}
