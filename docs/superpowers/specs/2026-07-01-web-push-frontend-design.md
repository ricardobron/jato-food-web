# Web Push (frontend) — Design

**Data:** 2026-07-01
**Repo:** jato-food (Next.js 14, App Router, TypeScript)
**Assenta em:** Web Push (backend) — Lote 5 (`docs/superpowers/specs/2026-07-01-web-push-backend-design.md` no repo `jato-food-backend`).

## Objetivo

Permitir que o cliente receba no dispositivo a mensagem manual do admin **mesmo com a app/browser fechado**, através do backend de Web Push do Lote 5. Hoje a entrega em tempo real (Socket.IO, Lote 4) só chega com um socket aberto; o Web Push preenche o caso da app fechada/em segundo plano. É um **extra por cima** do socket, apenas para clientes (`role !== 'ADMIN'`).

## Contexto (estado atual do frontend)

- **Next.js 14.2.3**, App Router, TS (`strict`), alias `@/*`. Sem PWA/manifest/Service Worker hoje. `next.config.mjs` vazio.
- **Auth:** next-auth v4, JWT em `session.jwt`, `role` (`'USER' | 'ADMIN'`). Componentes leem via `useSession()`.
- **API:** axios partilhado em `src/lib/api.ts` (`baseURL = NEXT_PUBLIC_API_BASE_URL`). Padrão dos serviços: recebem `token` e fazem `api.defaults.headers.Authorization = \`Bearer ${token}\`` antes da chamada (ex.: `src/service/notification.ts`).
- **Lote 4 (notificações, já merged):**
  - `NotificationNoticeModal.tsx` — popup RGPD de 1ª visita, gated por `localStorage['jato_notif_notice_v1']`. O botão "Ativar notificações" (`enable()`) chama `Notification.requestPermission()` e fecha. **É o ponto natural para enganchar a subscrição de push.**
  - `NotificationBell.tsx` — subscreve o socket `client_notification`, faz prepend + toast + `notificationFeedback(message)`.
  - `notificationFeedback.ts` — `vibrate()` + `playBeep()` (Web Audio) + `systemNotify(message)` (só dispara `new Notification('JATO', {body})` quando `document.hidden && Notification.permission === 'granted'`).
  - `ClientComponentPage.tsx` (`src/app/client/`) — landing do cliente logado; renderiza `<NotificationNoticeModal />`. Dentro de `client/layout.tsx` que renderiza `<HeaderClient />` → `<NotificationBell />` (gated a `role !== 'ADMIN'`).
- **Ícones:** PNGs já presentes (staged) em `src/app/` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon-16.png`, `favicon-32.png`), hoje órfãos (não referenciados por nenhum `metadata.icons`).

## Contrato com o backend (Lote 5)

- `GET /push/public-key` → `{ publicKey: string }` (VAPID public key, base64url). **Guardado** (`USER`/`ADMIN`) → chamar com o jwt.
- `POST /push/subscribe` — body `{ endpoint, keys: { p256dh, auth } }`; `user_id` vem do jwt. Upsert por `endpoint` (re-subscrever o mesmo dispositivo não duplica).
- `DELETE /push/subscribe` — existe no backend mas **não é usado** nesta fase (opt-out fora de âmbito).
- **Payload do push** enviado pelo backend (via `web-push`, `JSON.stringify`):
  ```json
  { "title": "JATO", "body": "<mensagem>", "data": { "order_number": <n>, "notification_id": "<id>" } }
  ```

## Decisões (do brainstorming)

1. **Service Worker à mão** (sem `next-pwa`/`serwist`): um `public/sw.js` mínimo só com `push` + `notificationclick`. Zero dependências novas, sem caching/offline.
2. **Subscrição:** o botão "Ativar notificações" do modal RGPD subscreve na 1ª vez; **re-sync automático** em cada entrada do cliente quando a permissão já está `granted` (idempotente via upsert do backend) — cobre subscrições expiradas e novos dispositivos.
3. **iOS:** manifest torna a app instalável; **deteção leve** mostra uma dica ("Adicionar ao ecrã principal") quando é iOS Safari ainda não-instalado. Sem fluxo guiado pesado.
4. **Sem opt-out explícito** na UI nesta fase (revoga-se nas definições do browser/OS; o backend apaga subs mortas em 410/404).
5. **Sem duplicação de notificação de sistema:** com o Web Push ativo, **remove-se o `systemNotify`** do Lote 4 (o `new Notification` quando `document.hidden`). Esse papel passa a ser exclusivamente do push do SW. Ficam `vibrate` + `beep` + toast para o separador aberto.

## Arquitetura e ficheiros

### Novos

- **`public/sw.js`** — Service Worker (servido na raiz do domínio → scope `/`). Sem TypeScript (ficheiro estático). Dois handlers:
  - `push`: faz `event.data.json()` → `{ title, body, data }`; `event.waitUntil(self.registration.showNotification(title || 'JATO', { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data }))`. Tudo em `try/catch` (fallback para `event.data?.text()` se não for JSON).
  - `notificationclick`: `event.notification.close()`; `event.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }))` → se houver janela `/client` foca-a, senão `clients.openWindow('/client')`.

- **`src/app/manifest.ts`** — Next 14 metadata route (auto-servido em `/manifest.webmanifest`, auto-linkado no `<head>`):
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
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    };
  }
  ```
  (Cores de tema a alinhar com a paleta existente durante a implementação.)

- **`public/icons/`** — mover para cá os PNGs órfãos de `src/app/` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`), dando-lhes URLs estáveis para o manifest e o SW.

- **`src/service/push.ts`** — no padrão dos serviços existentes:
  - `getVapidPublicKey(token): Promise<string>` → `GET /push/public-key` → `.publicKey`.
  - `savePushSubscription(token, sub): Promise<void>` → `POST /push/subscribe` com `{ endpoint, keys: { p256dh, auth } }` extraídos de `sub.toJSON()`.

- **`src/lib/pushSubscription.ts`** — lógica do lado do cliente (toda best-effort, em `try/catch`):
  - `isPushSupported(): boolean` → `'serviceWorker' in navigator && 'PushManager' in window`.
  - `registerServiceWorker(): Promise<ServiceWorkerRegistration>` → `navigator.serviceWorker.register('/sw.js')`.
  - `urlBase64ToUint8Array(base64: string): Uint8Array` — util-padrão para converter a VAPID public key em `applicationServerKey`.
  - `subscribeToPush(jwt): Promise<void>` — regista o SW, busca a VAPID key, `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`, e `savePushSubscription(jwt, sub)`.
  - `ensurePushSubscription(jwt): Promise<void>` — re-sync silencioso: só age se `isPushSupported()` e `Notification.permission === 'granted'`; reutiliza `registration.pushManager.getSubscription()` ou subscreve, e faz `savePushSubscription` (idempotente).

- **`src/lib/pwa.ts`** — deteção:
  - `isIos(): boolean` → `/iphone|ipad|ipod/i.test(navigator.userAgent)` **ou** iPadOS (`navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1`).
  - `isInStandaloneMode(): boolean` → `(navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches`.
  - `isIosSafariNotInstalled(): boolean` → `isIos() && !isInStandaloneMode()`.

### Modificados

- **`src/components/NotificationNoticeModal.tsx`** — no `enable()`, após `Notification.requestPermission()` devolver `'granted'`, chama `subscribeToPush(jwt)` (jwt de `useSession()`); tudo em `try/catch` (nunca impede o `dismiss()`). Renderiza a **dica iOS** (uma linha de texto) quando `isIosSafariNotInstalled()`.
- **`src/app/client/ClientComponentPage.tsx`** — efeito de montagem (gated a não-admin): se `Notification.permission === 'granted'`, chama `ensurePushSubscription(jwt)` (re-sync). Best-effort.
- **`src/app/layout.tsx`** — adicionar `metadata.icons` (incl. `apple-touch-icon`) e `metadata.manifest` (implícito pelo `manifest.ts`), `export const viewport` com `themeColor`, e metas `apple-mobile-web-app-capable` / `apple-mobile-web-app-status-bar-style` (standalone no iOS).
- **`src/lib/notificationFeedback.ts`** — **remover o `systemNotify`** e a sua chamada em `notificationFeedback()` (mantendo `vibrate` + `playBeep` + toast). Evita a notificação de sistema duplicada agora que o SW/push a emite.

## Fluxo (dados)

1. **1ª visita:** cliente entra em `/client` → `NotificationNoticeModal`. "Ativar notificações" → `requestPermission()`; se `granted` → `subscribeToPush(jwt)`: regista `/sw.js` → `pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: <VAPID de GET /push/public-key> })` → `POST /push/subscribe`. Backend faz upsert por `endpoint`.
2. **Voltas seguintes** (permissão já `granted`): `ensurePushSubscription(jwt)` na montagem re-regista em silêncio (subscrição expirada / novo dispositivo).
3. **Admin envia mensagem** → backend `notifyClientPush` → push service → SW `push` (app fechada incluída) → `showNotification('JATO', { body })`. Toque → foca/abre `/client`.
4. **App aberta:** o socket do Lote 4 mostra toast + vibração + beep em tempo real; o push do SW dá a notificação de sistema. Sem notificação de **sistema** duplicada (o `systemNotify` do Lote 4 foi removido).

## Erros / robustez

Todo o caminho de push é **best-effort** e isolado em `try/catch`: permissão negada, browser sem Push API, `subscribe` rejeitado, ou backend em baixo **nunca** partem a UI do cliente — o modal fecha na mesma e o Lote 4 (socket/toast/feedback) continua a funcionar. O push nunca é pré-requisito de nada.

## Testes / verificação

- `npx tsc --noEmit` + `npx next build` limpos.
- Testes unitários das funções puras — `urlBase64ToUint8Array` (vetores conhecidos) e a deteção iOS (`isIosSafariNotInstalled` com user agents mockados) — **se** existir runner de testes no frontend; caso contrário, só type-check + build (como nos lotes anteriores).
- **Aceitação manual** (localhost é secure context, permite SW + Push): subscrever no cliente, o admin envia uma mensagem, e observar a **notificação de sistema com o separador fechado**; toque abre/foca `/client`. Screenshot de preview do modal (com a dica iOS) — temporário, apagado no fim, como nos lotes anteriores.

## Nota de plataforma

- **Android / Desktop (Chrome, Edge, Firefox):** abrir o site e aceitar a permissão; sem instalação.
- **iOS / iPadOS (Safari):** exige **instalar como PWA** (Adicionar ao ecrã principal) e **iOS 16.4+**. Sem PWA instalado, a Push API é bloqueada pela Apple — daí a dica de instalação.
- **HTTPS obrigatório** em produção (exceto `localhost`) para Service Workers e Push API.

## Fora de âmbito (futuro)

- Opt-out explícito na UI (`DELETE /push/subscribe` fica disponível para um lote futuro).
- Caching/offline PWA (o SW só trata de push).
- Push para o admin, ou broadcast a vários clientes.
- Ícones/ações/agrupamento personalizados por tipo de notificação.
