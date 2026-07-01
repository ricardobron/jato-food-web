# Web Push (Frontend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a logged-in client receive the admin's manual message as a device notification even with the app/browser closed, by subscribing to the Lote 5 Web Push backend from a hand-rolled Service Worker + installable PWA.

**Architecture:** A static `public/sw.js` handles `push` (show notification) and `notificationclick` (focus/open `/client`). A `src/app/manifest.ts` makes the app installable (required for iOS). Client-side helpers (`src/lib/pushSubscription.ts`, `src/service/push.ts`) register the SW, subscribe via `PushManager` using the backend's VAPID public key, and POST the subscription. The existing Lote 4 RGPD modal triggers the first opt-in; the client landing page re-syncs the subscription on every mount when permission is already granted. The Lote 4 `systemNotify` path is removed so the SW push is the single source of system notifications.

**Tech Stack:** Next.js 14.2.3 (App Router), TypeScript (strict), next-auth v4, axios, Service Worker + Push API + Web App Manifest. No new npm dependencies.

## Global Constraints

- **No new npm dependencies.** Hand-rolled Service Worker — no `next-pwa`, `serwist`, or `workbox`.
- **No frontend test runner exists** (only `next dev/build/start/lint`). Verification for every task is `npx tsc --noEmit` (fast) plus `npx next build` (authoritative) — there are NO unit-test steps. Do not add a test runner.
- **All push code is best-effort:** every push call path is wrapped in `try/catch` and must NEVER break the client UI. Push is additive on top of the existing Socket.IO delivery (Lote 4).
- **Clients only:** push logic runs only for `role !== 'ADMIN'`.
- **Auth:** JWT is read client-side via `useSession()` from `next-auth/react` → `session.data?.jwt`; role via `session.data?.user?.role`. Token is attached to axios by setting `api.defaults.headers.Authorization = \`Bearer ${token}\`` before the call (existing service pattern).
- **Backend contract (Lote 5, already deployed):**
  - `GET /push/public-key` → `{ publicKey: string }` (guarded — send the jwt).
  - `POST /push/subscribe` — body `{ endpoint, keys: { p256dh, auth } }`; upsert by `endpoint`.
  - Push payload the SW receives: `{ "title": "JATO", "body": "<message>", "data": { "order_number": <n>, "notification_id": "<id>" } }`.
- **Files:** SW at `public/sw.js` (served at `/sw.js`, scope `/`); manifest at `src/app/manifest.ts` (Next auto-serves `/manifest.webmanifest` and auto-links it — do NOT also set `metadata.manifest`); PWA icons under `public/icons/`.
- **Path alias:** `@/*` → `src/*`.
- Push notification title is the literal string `"JATO"`.

---

## File Structure

- **Create** `public/sw.js` — Service Worker: `push` + `notificationclick` handlers.
- **Create** `src/app/manifest.ts` — Web App Manifest (installability).
- **Create** `public/icons/` — relocate `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` here from `src/app/`.
- **Create** `src/service/push.ts` — `getVapidPublicKey`, `savePushSubscription`.
- **Create** `src/lib/pushSubscription.ts` — `isPushSupported`, `urlBase64ToUint8Array`, `registerServiceWorker`, `subscribeToPush`, `ensurePushSubscription`.
- **Create** `src/lib/pwa.ts` — `isIos`, `isInStandaloneMode`, `isIosSafariNotInstalled`.
- **Modify** `src/app/layout.tsx` — add `metadata.icons`, `metadata.appleWebApp`, `export const viewport` (themeColor).
- **Modify** `src/components/NotificationNoticeModal.tsx` — subscribe on "Ativar notificações"; iOS hint.
- **Modify** `src/app/client/ClientComponentPage.tsx` — re-sync effect on mount.
- **Modify** `src/lib/notificationFeedback.ts` — remove `systemNotify` (dedup).

---

## Task 1: Installable PWA foundation — Service Worker, manifest, icons, head metadata

**Files:**
- Create: `public/sw.js`
- Create: `src/app/manifest.ts`
- Move: `src/app/icon-192.png` → `public/icons/icon-192.png`; `src/app/icon-512.png` → `public/icons/icon-512.png`; `src/app/apple-touch-icon.png` → `public/icons/apple-touch-icon.png`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: nothing (foundation).
- Produces: a Service Worker at `/sw.js` that shows a notification on `push` and focuses/opens `/client` on `notificationclick`; `/manifest.webmanifest` served and auto-linked; icons at `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/apple-touch-icon.png`.

- [ ] **Step 1: Relocate the icon assets**

```bash
mkdir -p public/icons
git mv src/app/icon-192.png public/icons/icon-192.png
git mv src/app/icon-512.png public/icons/icon-512.png
git mv src/app/apple-touch-icon.png public/icons/apple-touch-icon.png
```
(Leave `src/app/favicon.ico`, `favicon-16.png`, `favicon-32.png` where they are.)

- [ ] **Step 2: Create the Service Worker**

Create `public/sw.js` (plain JS, no TypeScript — it is a static asset):

```js
/* JATO Web Push service worker — shows pushes and focuses the client app. */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'JATO', body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'JATO';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: payload.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = '/client';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes('/client') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
        return undefined;
      })
  );
});
```

- [ ] **Step 3: Create the Web App Manifest**

Create `src/app/manifest.ts`:

```ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JATO · Pede num jato',
    short_name: 'JATO',
    description: 'Pedidos de comida à mesa, rápidos como um jato.',
    start_url: '/client',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

- [ ] **Step 4: Add head metadata to the root layout**

In `src/app/layout.tsx`, change the type import line:

```ts
import type { Metadata } from 'next';
```
to:
```ts
import type { Metadata, Viewport } from 'next';
```

Then replace the existing `export const metadata` block with:

```ts
export const metadata: Metadata = {
  title: 'Jato · Pede num jato',
  description: 'Jato — pedidos de comida à mesa, rápidos como um jato.',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'JATO',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};
```
(Do NOT set `metadata.manifest` — `src/app/manifest.ts` auto-links it.)

- [ ] **Step 5: Verify type-check and build**

Run:
```bash
npx tsc --noEmit && npx next build
```
Expected: no TypeScript errors; build succeeds. After build, confirm the manifest route is generated (look for `/manifest.webmanifest` in the build route list) and that `public/sw.js` + `public/icons/*.png` exist.

- [ ] **Step 6: Commit**

```bash
git add public/sw.js src/app/manifest.ts public/icons src/app/layout.tsx src/app/icon-192.png src/app/icon-512.png src/app/apple-touch-icon.png
git commit -m "feat(push): PWA instalável — service worker, manifest, ícones, metadata"
```

---

## Task 2: Push subscription client logic — service + lib

**Files:**
- Create: `src/service/push.ts`
- Create: `src/lib/pushSubscription.ts`

**Interfaces:**
- Consumes: `api` from `@/lib/api`; backend `GET /push/public-key`, `POST /push/subscribe`.
- Produces:
  - `getVapidPublicKey(token: string): Promise<string>`
  - `savePushSubscription(token: string, subscription: PushSubscriptionPayload): Promise<void>` where `PushSubscriptionPayload = { endpoint: string; keys: { p256dh: string; auth: string } }`
  - `isPushSupported(): boolean`
  - `urlBase64ToUint8Array(base64String: string): Uint8Array`
  - `registerServiceWorker(): Promise<ServiceWorkerRegistration>`
  - `subscribeToPush(jwt: string): Promise<void>` — registers the SW, subscribes (or reuses an existing subscription), and saves it. Best-effort (never throws).
  - `ensurePushSubscription(jwt: string): Promise<void>` — no-op unless push is supported and `Notification.permission === 'granted'`; then calls `subscribeToPush`.

- [ ] **Step 1: Create the push API service**

Create `src/service/push.ts`:

```ts
import { api } from '@/lib/api';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export const getVapidPublicKey = async (token: string): Promise<string> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  const response = await api.get<{ publicKey: string }>('/push/public-key');
  return response.data.publicKey;
};

export const savePushSubscription = async (
  token: string,
  subscription: PushSubscriptionPayload
): Promise<void> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  await api.post('/push/subscribe', subscription);
};
```

- [ ] **Step 2: Create the subscription lib**

Create `src/lib/pushSubscription.ts`:

```ts
import { getVapidPublicKey, savePushSubscription } from '@/service/push';

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register('/sw.js');
}

function toPayload(subscription: PushSubscription) {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    },
  };
}

export async function subscribeToPush(jwt: string): Promise<void> {
  if (!isPushSupported()) return;
  try {
    await registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKey(jwt);
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));
    await savePushSubscription(jwt, toPayload(subscription));
  } catch {
    // best-effort: nunca partir a UI do cliente
  }
}

export async function ensurePushSubscription(jwt: string): Promise<void> {
  if (!isPushSupported()) return;
  if (
    typeof Notification === 'undefined' ||
    Notification.permission !== 'granted'
  ) {
    return;
  }
  await subscribeToPush(jwt);
}
```

- [ ] **Step 3: Verify type-check**

Run:
```bash
npx tsc --noEmit
```
Expected: no TypeScript errors. (The DOM lib provides `ServiceWorkerRegistration`, `PushSubscription`, `PushManager`, `atob`.)

- [ ] **Step 4: Commit**

```bash
git add src/service/push.ts src/lib/pushSubscription.ts
git commit -m "feat(push): serviço + lib de subscrição (SW register, subscribe, ensure)"
```

---

## Task 3: iOS detection + wire subscription into the RGPD modal

**Files:**
- Create: `src/lib/pwa.ts`
- Modify: `src/components/NotificationNoticeModal.tsx`

**Interfaces:**
- Consumes: `subscribeToPush` from `@/lib/pushSubscription` (Task 2); `useSession` from `next-auth/react`.
- Produces:
  - `isIos(): boolean`, `isInStandaloneMode(): boolean`, `isIosSafariNotInstalled(): boolean` in `src/lib/pwa.ts`.
  - The modal's "Ativar notificações" button now subscribes to push after permission is granted, and shows an iOS install hint when on iOS Safari not yet installed.

- [ ] **Step 1: Create the iOS/PWA detection helpers**

Create `src/lib/pwa.ts`:

```ts
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
```

- [ ] **Step 2: Wire subscription + iOS hint into the modal**

In `src/components/NotificationNoticeModal.tsx`:

Add these imports below the existing `import { primeAudio } ...` line:
```ts
import { useSession } from 'next-auth/react';
import { subscribeToPush } from '@/lib/pushSubscription';
import { isIosSafariNotInstalled } from '@/lib/pwa';
```

Inside the component, replace:
```ts
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // localStorage indisponível → não mostra
    }
  }, []);
```
with:
```ts
  const [open, setOpen] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const session = useSession();
  const jwt = session.data?.jwt;

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // localStorage indisponível → não mostra
    }
    setShowIosHint(isIosSafariNotInstalled());
  }, []);
```

Replace the existing `enable` function with:
```ts
  const enable = async () => {
    primeAudio();
    try {
      if (typeof Notification !== 'undefined') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && jwt) {
          await subscribeToPush(jwt);
        }
      }
    } catch {
      // ignore
    }
    dismiss();
  };
```

Add the iOS hint immediately after the closing `</div>` of the RGPD info box (the `<div className="rounded-lg bg-charcoal/5 ...">...</div>`), before `<DialogFooter>`:
```tsx
        {showIosHint && (
          <p className="text-xs leading-relaxed text-charcoal/60">
            No iPhone/iPad, toca em{' '}
            <span className="font-semibold">Partilhar</span> →{' '}
            <span className="font-semibold">Adicionar ao ecrã principal</span>{' '}
            para poderes receber notificações.
          </p>
        )}
```

- [ ] **Step 3: Verify type-check and build**

Run:
```bash
npx tsc --noEmit && npx next build
```
Expected: no TypeScript errors; build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/pwa.ts src/components/NotificationNoticeModal.tsx
git commit -m "feat(push): subscrição no botão do modal RGPD + dica de instalação iOS"
```

---

## Task 4: Auto re-sync subscription on client mount

**Files:**
- Modify: `src/app/client/ClientComponentPage.tsx`

**Interfaces:**
- Consumes: `ensurePushSubscription` from `@/lib/pushSubscription` (Task 2); `useSession` from `next-auth/react`.
- Produces: on every mount of the client landing page, if the user is a non-admin with a jwt and notification permission is already granted, the push subscription is re-registered idempotently.

- [ ] **Step 1: Add the re-sync effect**

Replace the entire contents of `src/app/client/ClientComponentPage.tsx` with:

```tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

import { useGeneral } from '@/store/general';
import { NewOrder } from '@/components/NewOrder';
import { Order } from '@/components/Order';
import { NotificationNoticeModal } from '@/components/NotificationNoticeModal';
import { ensurePushSubscription } from '@/lib/pushSubscription';

export const ClientComponentPage = () => {
  const { buttonOption } = useGeneral();
  const session = useSession();
  const jwt = session.data?.jwt;
  const isAdmin = session.data?.user?.role === 'ADMIN';

  useEffect(() => {
    if (jwt && !isAdmin) {
      ensurePushSubscription(jwt);
    }
  }, [jwt, isAdmin]);

  return (
    <>
      <NotificationNoticeModal />
      {buttonOption === 'my_orders' ? <Order /> : <NewOrder />}
    </>
  );
};
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
npx tsc --noEmit
```
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/client/ClientComponentPage.tsx
git commit -m "feat(push): re-sync idempotente da subscrição na entrada do cliente"
```

---

## Task 5: Remove Lote 4 `systemNotify` to avoid duplicate system notifications

**Files:**
- Modify: `src/lib/notificationFeedback.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `notificationFeedback(message: string)` now only vibrates + beeps (the toast is shown by the caller in `NotificationBell`); the system-level notification is delivered exclusively by the Service Worker push. `primeAudio` is unchanged.

- [ ] **Step 1: Delete the `systemNotify` function**

In `src/lib/notificationFeedback.ts`, remove the entire `systemNotify` function:

```ts
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
```

- [ ] **Step 2: Drop its call from `notificationFeedback`**

Replace:
```ts
export function notificationFeedback(message: string): void {
  vibrate();
  playBeep();
  systemNotify(message);
}
```
with:
```ts
export function notificationFeedback(): void {
  vibrate();
  playBeep();
}
```

- [ ] **Step 3: Update the caller**

In `src/components/NotificationBell.tsx`, find the call `notificationFeedback(data.message)` (inside the `client_notification` socket handler) and change it to `notificationFeedback()`. (Search: `grep -n "notificationFeedback(" src/components/NotificationBell.tsx`.)

- [ ] **Step 4: Verify type-check and build**

Run:
```bash
npx tsc --noEmit && npx next build
```
Expected: no TypeScript errors; build succeeds (no unused-parameter errors, since `notificationFeedback` no longer takes `message`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/notificationFeedback.ts src/components/NotificationBell.tsx
git commit -m "refactor(notification): remover systemNotify (o push do SW passa a dar a notificação de sistema)"
```

---

## Manual Acceptance (after all tasks — not a task step)

Web Push cannot be exercised by `tsc`/`next build`. On a real run (localhost is a secure context, so SW + Push work without HTTPS), verify end-to-end:

1. `yarn dev` (frontend) with the Lote 5 backend running.
2. Log in as a client, open `/client`; in the RGPD modal tap **Ativar notificações** and accept the browser permission.
3. In DevTools → Application → Service Workers, confirm `/sw.js` is activated; under Push, confirm a subscription exists. Confirm the backend received `POST /push/subscribe` (a `push_subscriptions` row for the user).
4. As an admin (another session), send a message to that client's order.
5. With the client tab **closed/backgrounded**, confirm a system notification titled **JATO** with the message body appears; clicking it focuses/opens `/client`.
6. With the client tab **open**, confirm the Lote 4 toast + vibration/beep still fire, and there is no duplicate *in-app* `new Notification` (only the SW system notification).
7. Capture a temporary preview screenshot of the modal (including the iOS hint via device emulation); delete it after — do not commit, matching prior lotes.

---

## Self-Review Notes

- **Spec coverage:** SW (Task 1), manifest/installability + iOS metadata (Task 1), icons (Task 1), push service + subscription lib incl. `ensurePushSubscription` re-sync (Task 2), iOS detection + modal opt-in + iOS hint (Task 3), mount re-sync (Task 4), `systemNotify` removal for dedup (Task 5). Opt-out and offline caching are explicitly out of scope per the spec.
- **Type consistency:** `PushSubscriptionPayload` (Task 2) matches the backend body and the `toPayload` output; `subscribeToPush(jwt)` / `ensurePushSubscription(jwt)` signatures are consumed unchanged in Tasks 3–4; `notificationFeedback()` becomes zero-arg in Task 5 and its only caller is updated in the same task.
- **No new dependencies; no test runner added; verification is tsc + next build + manual acceptance, matching the frontend's existing workflow.**
</content>
</invoke>
