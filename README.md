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

## Testes

npm test

## Migrando para o Supabase real

1. Crie um projeto em supabase.com.
2. Rode `supabase/schema.sql` no SQL editor do projeto.
3. Reimplemente as funções de `lib/data/*.ts` (mesma assinatura, troque o
   corpo de cada função por chamadas ao cliente Supabase) e troque a
   verificação de sessão em `lib/auth.ts` / `app/admin/(protected)/layout.tsx`
   pelo Supabase Auth. Nenhuma página precisa mudar.
