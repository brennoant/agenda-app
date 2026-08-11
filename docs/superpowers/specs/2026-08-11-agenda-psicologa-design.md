# Sistema de Agendamento para Psicóloga Autônoma — Design

## Contexto

Uma psicóloga que está começando a carreira, atende sozinha (sem clínica) e se
comunica com pacientes majoritariamente pelo WhatsApp. Ela precisa de uma
forma de deixar pacientes marcarem consulta sem trocar várias mensagens de
"qual horário você tem livre?", e de um painel simples para organizar sua
agenda, disponibilidade e pagamentos.

Este é um protótipo: o objetivo é validar o fluxo e o visual antes de
conectar a um projeto Supabase real e publicar em produção.

## Escopo

- Single-tenant: uma única psicóloga, uma única agenda, um único login de
  admin. Não há suporte a múltiplos profissionais nesta versão.
- Sem integrações externas de envio automático (WhatsApp Business API,
  e-mail transacional) nesta fase.
- Sem cobrança/pagamento online — o controle de pagamento é manual
  (a psicóloga marca "pago"/"pendente" e o valor no admin).

## Arquitetura

- **Next.js (App Router)** + **Tailwind** + **shadcn/ui**.
- Duas áreas de rotas:
  - `/agendar` — pública, sem login, para a paciente escolher horário.
  - `/admin` — protegida por login (Supabase Auth, e-mail/senha), para a
    psicóloga.
- Camada de acesso a dados isolada em `lib/data/*` com funções como
  `getAvailability()`, `createBooking()`, `getWeeklySchedule()`,
  `blockSlot()`, `listAppointments()`. As telas só chamam essas funções —
  nunca acessam a fonte de dados diretamente.
- **Fase 1 (este protótipo):** `lib/data` implementada com dados em memória
  (seed inicial), reiniciando a cada execução do servidor. Isso evita
  depender de Docker/Supabase CLI só para visualizar o protótipo.
- **Fase 2 (fora de escopo aqui):** trocar a implementação de `lib/data` por
  chamadas ao Supabase, usando o schema SQL abaixo. As telas não mudam.

## Modelo de dados (schema alvo do Supabase)

```sql
weekly_schedule (
  id, weekday (0-6), start_time, end_time, session_duration_minutes
)

blocked_slots (
  id, date, start_time (nullable = dia inteiro), end_time (nullable), reason
)

appointments (
  id, patient_name, patient_whatsapp, date, start_time, end_time,
  status ('agendado' | 'cancelado' | 'reagendado'),
  payment_status ('pago' | 'pendente'),
  amount_cents,
  created_at
)
```

Autenticação da psicóloga usa o Supabase Auth nativo (1 usuário), sem
tabela própria.

## Fluxo da paciente (`/agendar`)

1. Vê os próximos dias com horários livres. Os horários livres são
   **calculados na hora** (não pré-gerados): `weekly_schedule` menos
   `blocked_slots` menos horários já ocupados em `appointments` com status
   `agendado`.
2. Escolhe um horário e preenche **nome + WhatsApp**.
3. Ao confirmar, o sistema tenta criar o `appointment`. Se o horário acabou
   de ser ocupado por outra pessoa (condição de corrida), a criação falha e
   a paciente vê "esse horário acabou de ser ocupado, escolha outro",
   voltando à lista atualizada.
4. Em caso de sucesso, mostra uma tela de confirmação com os detalhes da
   consulta (data, horário). Não há envio automático de WhatsApp/e-mail.

Regras:
- Horários no passado nunca aparecem como disponíveis.
- Duração da sessão vem de `weekly_schedule.session_duration_minutes`.

## Fluxo da psicóloga (`/admin`)

- **Login**: e-mail/senha via Supabase Auth.
- **Agenda**: lista das consultas marcadas (nome, WhatsApp, data/horário,
  status de pagamento, valor), com ações de cancelar e reagendar.
- **Disponibilidade**: tela para configurar a grade semanal (dias da
  semana, horário de início/fim, duração da sessão).
- **Bloqueios**: marcar dias inteiros ou horários específicos como
  indisponíveis (ex.: feriado, compromisso pessoal), mesmo dentro da grade
  padrão.
- **Pagamentos**: marcar cada consulta como paga/pendente e registrar o
  valor cobrado.

## Tratamento de erros e casos de borda

- Concorrência na criação de um agendamento (dois pacientes no mesmo
  horário): a segunda tentativa é rejeitada com mensagem clara.
- Cancelamento de uma consulta libera o horário automaticamente para novos
  agendamentos.
- Bloqueio de um horário que já tem consulta marcada: o sistema avisa e
  não remove a consulta existente automaticamente (a psicóloga decide).

## Visual

Estilo calmo/acolhedor: tons suaves (verde-água, lilás, bege), tipografia
arredondada — adequado ao nicho de saúde mental. Aplica-se principalmente à
página pública `/agendar`; o `/admin` pode ser mais neutro/funcional.

## Testes

Nível de protótipo: verificação manual dos fluxos principais (agendar,
cancelar, bloquear horário, configurar grade, marcar pagamento) rodando
localmente no navegador. Sem suíte automatizada nesta fase.

## Fora de escopo (explicitamente adiado)

- Multi-tenant (várias psicólogas).
- Envio automático de WhatsApp/e-mail (confirmação, lembrete).
- Pagamento online / integração com gateway.
- Autenticação da paciente (ela nunca faz login).
