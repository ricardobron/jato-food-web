import { API_BASE_URL } from '@/constants';

/**
 * Keep-alive do backend no Render (free tier).
 *
 * O Render hiberna serviços gratuitos após ~15 min sem tráfego HTTP.
 * Enquanto o toggle estiver ligado, pingamos com folga a cada 10 min
 * para o manter acordado. Ao desligar, deixa de haver tráfego e o
 * Render volta a hibernar no tempo dele.
 */
export const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 min

// Timeout generoso: um cold start do Render pode demorar ~60s.
const PING_TIMEOUT_MS = 60 * 1000;

// Endpoint leve. Se ainda não existir no backend, um 404 continua a
// contar como tráfego e acorda o Render na mesma.
const PING_URL = `${API_BASE_URL}/health`;

export type PingResult = 'awake' | 'unreachable';

export async function pingBackend(): Promise<PingResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    // Qualquer resposta HTTP (mesmo 404/401) significa que o servidor
    // respondeu, logo está acordado.
    await fetch(PING_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    return 'awake';
  } catch {
    // Erro de rede / abort => provável cold start em curso ou offline.
    return 'unreachable';
  } finally {
    clearTimeout(timeout);
  }
}
