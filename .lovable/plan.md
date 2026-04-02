

## Diagnóstico

Existem 3 problemas principais impedindo o funcionamento:

### 1. AuthContext está usando dados mockados
O `useAuth()` retorna um usuário falso com `id: "dev-user"` em vez do usuário real autenticado. Isso causa erros 400 em todas as consultas ao banco (profiles) porque `"dev-user"` não é um UUID válido. O usuário real está autenticado (JWT válido nos headers), mas o mock sobrescreve tudo.

### 2. Edge function `scrape-product` não está funcionando
A função não gera logs, indicando que está crashando no deploy ou timeout. As chamadas retornam "Failed to fetch".

### 3. Existe uma função `fetch-product` mais robusta que não é utilizada
O código tem duas funções de scraping: `scrape-product` (simples, 331 linhas) e `fetch-product` (avançada, 762 linhas com DOM parser). O cliente chama apenas `scrape-product`.

---

## Plano de Correção

### Passo 1: Restaurar autenticação real no AuthContext
- Remover o mock `"dev-user"` do `useAuth()` e do `AuthProvider`
- Usar o estado real do Supabase Auth que já está implementado no `useEffect`
- O usuário já está logado (JWT válido), então tudo passará a funcionar

### Passo 2: Consolidar as funções de scraping
- Atualizar `scrape-product/index.ts` com o código funcional e testado, removendo a dependência de `deno_dom` (que pode estar causando o crash)
- Usar apenas regex e JSON-LD para extração, sem parser DOM externo
- Manter a lógica multi-loja (Shopee, Amazon, ML, Hotmart, Kiwify, fallback genérico)

### Passo 3: Remover a função `fetch-product` duplicada
- Deletar `supabase/functions/fetch-product/index.ts` para evitar confusão

---

## Detalhes Técnicos

**AuthContext (`src/contexts/AuthContext.tsx`)**:
- Restaurar `useAuth()` para usar o `useContext(AuthContext)` padrão
- Remover valores hardcoded do `AuthProvider`, usar state real (`user`, `session`, `loading`, `isAdmin`)

**scrape-product (`supabase/functions/scrape-product/index.ts`)**:
- Reescrever sem dependência de `deno_dom` (import externo pode causar crash no deploy)
- Incorporar as melhores partes do `fetch-product`: JSON-LD, rotação de User-Agent, extração por regex
- Manter CORS headers padrão

