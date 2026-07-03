import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PingResult } from '@/lib/keepAlive';

export type KeepAliveStatus = 'idle' | 'pinging' | PingResult;

interface IKeepAliveStore {
  /** Preferência do utilizador — persiste entre reloads. */
  enabled: boolean;
  /** Estado volátil do último ping (não persistido). */
  status: KeepAliveStatus;
  lastPingAt: number | null;
  toggle: () => void;
  setStatus: (status: KeepAliveStatus) => void;
  setLastPingAt: (ts: number) => void;
}

export const useKeepAlive = create<IKeepAliveStore>()(
  persist(
    (set) => ({
      enabled: false,
      status: 'idle',
      lastPingAt: null,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setStatus: (status) => set({ status }),
      setLastPingAt: (ts) => set({ lastPingAt: ts }),
    }),
    {
      name: 'jato-keep-alive',
      // Só guardamos a preferência do toggle, não o estado volátil.
      partialize: (s) => ({ enabled: s.enabled }),
    }
  )
);
