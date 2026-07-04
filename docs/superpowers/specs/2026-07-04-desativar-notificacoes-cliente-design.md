# Desativar/ativar notificações no sininho (cliente)

**Data:** 2026-07-04
**Estado:** Aprovado

## Objetivo

Permitir que o utilizador cliente **pare de receber** notificações push (e as volte a
ativar) de forma clara e intuitiva, a partir do popover do sininho (`NotificationBell`)
no header da área do cliente.

Hoje o único ponto de ativação é o `NotificationNoticeModal` (mostrado uma vez por
browser). Não existe qualquer fluxo de desativação — o texto RGPD apenas remete o
utilizador para as definições do navegador.

## Contexto técnico

- Repositório **frontend-only** (Next.js 14 App Router + TypeScript). O backend é um
  serviço separado (`jato-food-backend.onrender.com`).
- Subscrição push: `src/lib/pushSubscription.ts` (`subscribeToPush`,
  `ensurePushSubscription`, `isPushSupported`).
- Serviços backend: `src/service/push.ts` (`GET /push/public-key`,
  `POST /push/subscribe`).
- Sininho: `src/components/NotificationBell.tsx` — um `Popover` (Radix) no header
  (`src/components/HeaderClient.tsx`) que lista as notificações. Só é renderizado para
  utilizadores não-ADMIN.
- Feedback ao utilizador via `toast` do `sonner` (já usado no componente).

## Decisões

1. **Local da UI:** dentro do popover do sininho, num rodapé fixo abaixo da lista.
2. **Backend:** ao desativar, além do `pushManager.unsubscribe()` no browser, o frontend
   chama `DELETE /push/unsubscribe` para o backend apagar o registo guardado.
   O endpoint tem de ser adicionado no backend separado (fora deste repositório).

## Componentes e alterações

### 1. `src/service/push.ts` — nova função

```ts
export const deletePushSubscription = async (
  token: string,
  endpoint: string
): Promise<void> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  await api.delete('/push/unsubscribe', { data: { endpoint } });
};
```

**Contrato backend (a implementar noutro repo):** `DELETE /push/unsubscribe`, body
`{ endpoint: string }`, `Authorization: Bearer <jwt>`. Apaga a subscrição cujo endpoint
corresponde, para o utilizador autenticado.

### 2. `src/lib/pushSubscription.ts` — duas funções novas (best-effort)

- `hasActivePushSubscription(): Promise<boolean>`
  - Se `!isPushSupported()` → `false`.
  - Usa `navigator.serviceWorker.getRegistration()` (não `ready`, que pendura quando o
    SW não está registado) e `registration.pushManager.getSubscription()`.
  - Retorna `!!subscription`. `try/catch` → `false`.

- `unsubscribeFromPush(jwt: string): Promise<void>`
  - Se `!isPushSupported()` → return.
  - Obtém `registration = await navigator.serviceWorker.getRegistration()`; se não
    existir → return.
  - `subscription = await registration.pushManager.getSubscription()`; se não existir →
    return.
  - Guarda `endpoint = subscription.endpoint` **antes** de cancelar.
  - `await subscription.unsubscribe()` (browser deixa de receber).
  - `await deletePushSubscription(jwt, endpoint)` (backend apaga registo).
  - `try/catch` que nunca parte a UI (mesmo padrão de `subscribeToPush`).

### 3. `src/components/NotificationBell.tsx` — secção de rodapé

- Estado local: `pushState: 'loading' | 'enabled' | 'disabled' | 'blocked' | 'unsupported'`.
- Cálculo do estado numa função `refreshPushState()`:
  - `!isPushSupported()` → `unsupported`.
  - `Notification.permission === 'denied'` → `blocked`.
  - `await hasActivePushSubscription()` → `enabled` se true, senão `disabled`.
  - Corre no mount e sempre que o popover abre (dentro de `onOpenChange`).
- Handlers:
  - `handleDisable()`: `setPushState('loading')` → `unsubscribeFromPush(jwt)` →
    `refreshPushState()` → `toast('Notificações desativadas')`.
  - `handleEnable()`: espelha o `enable()` do modal — `primeAudio()`,
    `Notification.requestPermission()`, se `granted` e `jwt` → `subscribeToPush(jwt)` →
    `refreshPushState()` → `toast('Notificações ativadas')`.
- Render do rodapé no `PopoverContent`, abaixo da lista, com borda superior:
  - `enabled`: linha "Notificações ativadas" + `Button` "Desativar notificações".
  - `disabled`: `Button` "Ativar notificações".
  - `blocked`: texto "Notificações bloqueadas — reativa nas definições do navegador".
  - `unsupported`: rodapé escondido.
  - `loading`: botão desativado/estado neutro.

## Fluxo

**Desativar:** utilizador abre sininho → vê "Notificações ativadas" → clica "Desativar"
→ `pushManager.unsubscribe()` no browser + `DELETE /push/unsubscribe` no backend → estado
passa a `disabled`, toast de confirmação.

**Reativar:** clica "Ativar notificações" → pede permissão (se necessário) +
`subscribeToPush` → estado `enabled`.

## Tratamento de erros

- Todas as funções de `pushSubscription.ts` são best-effort com `try/catch` — nunca
  partem a UI do cliente, mantendo o padrão existente.
- Falha de rede no `DELETE` não impede o `unsubscribe()` local (browser já deixou de
  receber); apenas o registo backend fica por limpar.

## Verificação

- A lógica que depende de APIs de browser (service worker / pushManager) é difícil de
  testar por unidade neste repo — validação **manual** do fluxo ativar → desativar →
  reativar.
- `npm run build` e lint no fim para garantir integridade.

## Fora de âmbito (YAGNI)

- Implementação do endpoint backend `DELETE /push/unsubscribe` (repositório separado).
- Alterações ao `NotificationNoticeModal` (mantém-se como está).
- Preferências granulares de notificação (por tipo de evento).
