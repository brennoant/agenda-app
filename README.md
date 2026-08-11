# Agenda — protótipo

Protótipo de sistema de agendamento para uma psicóloga autônoma. Ver o
desenho completo em `docs/superpowers/specs/2026-08-11-agenda-psicologa-design.md`.

## Rodando localmente

npm install
npm run dev

- Página pública de agendamento: http://localhost:3000/agendar
- Área da psicóloga: http://localhost:3000/admin/login
  (credenciais padrão do protótipo: psicologa@example.com / senha123,
  configuráveis via as variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD)

Os dados ficam em memória e são reiniciados a cada `npm run dev`.

## Variáveis de ambiente

| Variável         | Padrão (protótipo)                    | Obrigatório mudar em produção? |
| ---------------- | -------------------------------------- | ------------------------------ |
| `ADMIN_EMAIL`    | `psicologa@example.com`               | Sim                             |
| `ADMIN_PASSWORD` | `senha123`                             | Sim                             |
| `SESSION_SECRET` | `prototype-secret-troque-em-producao` | Sim                             |

`SESSION_SECRET` assina o cookie de sessão do admin (`lib/auth.ts`). O valor
padrão é público (está neste repositório) — se a variável não for definida
em um deploy real, qualquer pessoa pode forjar um cookie `admin_session`
válido usando esse segredo conhecido e obter acesso de administrador sem
fazer login. **Antes de qualquer deploy real/público, defina
`SESSION_SECRET` como um valor aleatório** (ex.: `openssl rand -base64 32`),
além de trocar `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

## Testes

npm test

## Migrando para o Supabase real

1. Crie um projeto em supabase.com.
2. Rode `supabase/schema.sql` no SQL editor do projeto (isso também
   habilita Row Level Security nas tabelas — veja o TODO de policies no
   próprio arquivo antes de ir para produção).
3. Reimplemente as funções de `lib/data/*.ts` para chamar o cliente
   Supabase em vez de operar em memória. A assinatura de cada função muda:
   chamadas ao Supabase são assíncronas, então toda função passa a
   retornar uma `Promise` (ex.: `getAvailableSlots` vira
   `Promise<AvailableSlot[]>`). Isso não é uma troca "sem tocar nas
   páginas" — cada Server Component que hoje chama essas funções
   diretamente (`app/agendar/page.tsx`,
   `app/admin/(protected)/page.tsx`, `disponibilidade/page.tsx`,
   `bloqueios/page.tsx`) precisa virar `async` e usar `await` nas
   chamadas. É uma mudança mecânica (não muda a lógica das páginas), mas
   é uma mudança em cada página, não zero mudanças. Troque também a
   verificação de sessão em `lib/auth.ts` /
   `app/admin/(protected)/layout.tsx` pelo Supabase Auth.
