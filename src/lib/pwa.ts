export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOSDevice = /iPhone|iPad|iPod/i.test(ua);
  const iPadOS =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

export function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone =
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  const displayStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  return iosStandalone || displayStandalone;
}

export function isIosSafariNotInstalled(): boolean {
  return isIos() && !isInStandaloneMode();
}
