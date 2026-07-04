# Desativar/ativar notificações no sininho Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o cliente pare (e volte a ativar) as notificações push a partir do popover do sininho, de forma clara e intuitiva.

**Architecture:** Adicionar um serviço de remoção de subscrição (`DELETE /push/unsubscribe`), duas funções best-effort na camada de push (`hasActivePushSubscription`, `unsubscribeFromPush`), e uma secção de rodapé no `NotificationBell` que reflete o estado atual e expõe botões Ativar/Desativar.

**Tech Stack:** Next.js 14 (App Router), TypeScript, React 18, axios (`src/lib/api.ts`), Web Push API (service worker + `PushManager`), sonner (toasts), Radix Popover.

## Global Constraints

- Repositório frontend-only; o endpoint backend `DELETE /push/unsubscribe` é implementado noutro repositório e está fora de âmbito.
- Todas as funções de `src/lib/pushSubscription.ts` são best-effort: `try/catch` que nunca parte a UI (mesmo padrão de `subscribeToPush`).
- Autenticação: `api.defaults.headers.Authorization = \`Bearer ${token}\`` antes de cada chamada (padrão de `src/service/push.ts`).
- Copy em português europeu, consistente com o existente.
- Não há infraestrutura de testes unitários neste repo; a lógica de browser (service worker/PushManager) é validada manualmente. Verificação final: `npm run build`.
- O `NotificationBell` só é renderizado para utilizadores não-ADMIN (já garantido em `HeaderClient.tsx:62`).

---

### Task 1: Serviço de remoção de subscrição

**Files:**
- Modify: `src/service/push.ts` (adicionar função no fim, junto de `savePushSubscription`)

**Interfaces:**
- Consumes: `api` de `@/lib/api`.
- Produces: `deletePushSubscription(token: string, endpoint: string): Promise<void>` — envia `DELETE /push/unsubscribe` com body `{ endpoint }`.

- [ ] **Step 1: Adicionar a função `deletePushSubscription`**

No fim de `src/service/push.ts`, após `savePushSubscription`:

```ts
export const deletePushSubscription = async (
  token: string,
  endpoint: string
): Promise<void> => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
  await api.delete('/push/unsubscribe', { data: { endpoint } });
};
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos relativos a `src/service/push.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/service/push.ts
git commit -m "feat: serviço deletePushSubscription (DELETE /push/unsubscribe)"
```

---

### Task 2: Funções de estado e cancelamento de push

**Files:**
- Modify: `src/lib/pushSubscription.ts` (adicionar `import` de `deletePushSubscription` e duas funções no fim)

**Interfaces:**
- Consumes: `isPushSupported()` (mesmo ficheiro), `deletePushSubscription` da Task 1.
- Produces:
  - `hasActivePushSubscription(): Promise<boolean>` — `true` se existe uma subscrição push ativa.
  - `unsubscribeFromPush(jwt: string): Promise<void>` — cancela no browser e apaga no backend, best-effort.

- [ ] **Step 1: Atualizar o import no topo do ficheiro**

Alterar a primeira linha de `src/lib/pushSubscription.ts`:

```ts
import {
  getVapidPublicKey,
  savePushSubscription,
  deletePushSubscription,
} from '@/service/push';
```

- [ ] **Step 2: Adicionar `hasActivePushSubscription` no fim do ficheiro**

```ts
export async function hasActivePushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Adicionar `unsubscribeFromPush` no fim do ficheiro**

```ts
export async function unsubscribeFromPush(jwt: string): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    const { endpoint } = subscription;
    await subscription.unsubscribe();
    await deletePushSubscription(jwt, endpoint);
  } catch {
    // best-effort: nunca partir a UI do cliente
  }
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos relativos a `src/lib/pushSubscription.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pushSubscription.ts
git commit -m "feat: hasActivePushSubscription e unsubscribeFromPush"
```

---

### Task 3: Secção Ativar/Desativar no popover do sininho

**Files:**
- Modify: `src/components/NotificationBell.tsx`

**Interfaces:**
- Consumes: `isPushSupported`, `subscribeToPush`, `unsubscribeFromPush`, `hasActivePushSubscription` de `@/lib/pushSubscription`; `primeAudio` de `@/lib/notificationFeedback` (já usado — reutilizar o import existente); `toast` de `sonner` (já importado); `useState`/`useCallback` (já importados).
- Produces: rodapé no `PopoverContent` com estado `pushState` e botões Ativar/Desativar.

- [ ] **Step 1: Atualizar imports**

No topo de `src/components/NotificationBell.tsx` (nota: `primeAudio` já está importado de `@/lib/notificationFeedback` e `useCallback`/`useEffect`/`useState` já estão importados de `react` — não mexer nesses):

- Adicionar novo import de push:

```ts
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  hasActivePushSubscription,
} from '@/lib/pushSubscription';
```

- Adicionar `Button`:

```ts
import { Button } from '@/components/ui/button';
```

- [ ] **Step 2: Adicionar estado e lógica de push dentro do componente**

Logo após `const [unread, setUnread] = useState(0);`:

```ts
type PushState = 'loading' | 'enabled' | 'disabled' | 'blocked' | 'unsupported';
const [pushState, setPushState] = useState<PushState>('loading');
```

E, após a declaração de `const jwt = session.data?.jwt;`, adicionar:

```ts
const refreshPushState = useCallback(async () => {
  if (!isPushSupported()) {
    setPushState('unsupported');
    return;
  }
  if (
    typeof Notification !== 'undefined' &&
    Notification.permission === 'denied'
  ) {
    setPushState('blocked');
    return;
  }
  const active = await hasActivePushSubscription();
  setPushState(active ? 'enabled' : 'disabled');
}, []);

const handleEnablePush = useCallback(async () => {
  setPushState('loading');
  primeAudio();
  try {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && jwt) {
        await subscribeToPush(jwt);
      }
    }
    toast('Notificações ativadas');
  } catch {
    // ignore
  }
  await refreshPushState();
}, [jwt, refreshPushState]);

const handleDisablePush = useCallback(async () => {
  setPushState('loading');
  if (jwt) {
    await unsubscribeFromPush(jwt);
  }
  toast('Notificações desativadas');
  await refreshPushState();
}, [jwt, refreshPushState]);
```

- [ ] **Step 3: Calcular estado no mount**

Adicionar um `useEffect` junto dos existentes:

```ts
useEffect(() => {
  refreshPushState();
}, [refreshPushState]);
```

- [ ] **Step 4: Recalcular estado quando o popover abre**

Alterar `onOpenChange` para também chamar `refreshPushState()` quando abre. O corpo passa a:

```ts
const onOpenChange = useCallback(
  (open: boolean) => {
    if (open) {
      refreshPushState();
      if (unread > 0 && jwt) {
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        markNotificationsRead(jwt).catch(() => {});
      }
    }
  },
  [unread, jwt, refreshPushState]
);
```

- [ ] **Step 5: Renderizar o rodapé no `PopoverContent`**

Imediatamente antes do fecho `</PopoverContent>` (após o `<div className="max-h-80 overflow-y-auto">...</div>`):

```tsx
{pushState !== 'unsupported' && (
  <div className="border-t px-4 py-3">
    {pushState === 'enabled' && (
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-charcoal/60">
          Notificações ativadas
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDisablePush}
        >
          Desativar
        </Button>
      </div>
    )}
    {pushState === 'disabled' && (
      <Button
        type="button"
        size="sm"
        className="w-full"
        onClick={handleEnablePush}
      >
        Ativar notificações
      </Button>
    )}
    {pushState === 'blocked' && (
      <p className="text-xs leading-relaxed text-charcoal/50">
        Notificações bloqueadas. Reativa-as nas definições do navegador.
      </p>
    )}
    {pushState === 'loading' && (
      <p className="text-center text-xs text-charcoal/40">A carregar…</p>
    )}
  </div>
)}
```

- [ ] **Step 6: Verificar tipos e build**

Run: `npx tsc --noEmit && npm run build`
Expected: build sem erros.

- [ ] **Step 7: Validação manual**

1. Como cliente não-ADMIN, abrir o sininho → confirmar rodapé.
2. Se já subscrito: ver "Notificações ativadas" + botão "Desativar" → clicar → toast "Notificações desativadas" → estado passa a botão "Ativar notificações".
3. Clicar "Ativar notificações" → (se necessário aceitar permissão) → toast "Notificações ativadas" → estado volta a "ativadas".
4. Confirmar no DevTools → Application → Service Workers / Push que a subscrição foi removida e recriada.

- [ ] **Step 8: Commit**

```bash
git add src/components/NotificationBell.tsx
git commit -m "feat: ativar/desativar notificações no popover do sininho"
```

---

## Notas de integração

- **Backend (fora deste repo):** implementar `DELETE /push/unsubscribe` (body `{ endpoint }`, `Authorization: Bearer <jwt>`) que apaga a subscrição correspondente do utilizador autenticado. Até lá, o `unsubscribe()` no browser já para a receção; a chamada backend falhará silenciosamente (best-effort).
- O `NotificationNoticeModal` mantém-se inalterado.
