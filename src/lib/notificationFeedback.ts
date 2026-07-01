let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  } catch {
    return null;
  }
}

// Chamar num gesto do utilizador para satisfazer a política de autoplay.
export function primeAudio(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function playBeep(): void {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  } catch {
    // ignore
  }
}

function vibrate(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([120, 60, 120]);
    }
  } catch {
    // ignore
  }
}

function systemNotify(message: string): void {
  try {
    if (
      typeof document !== 'undefined' &&
      document.hidden &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      new Notification('JATO', { body: message });
    }
  } catch {
    // ignore
  }
}

export function notificationFeedback(message: string): void {
  vibrate();
  playBeep();
  systemNotify(message);
}
