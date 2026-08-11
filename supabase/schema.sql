-- Schema alvo para o Supabase. Depois que o projeto Supabase for criado,
-- rode este arquivo no SQL editor para criar as tabelas que lib/data vai
-- usar quando for migrado de dados em memória para Supabase.

create table weekly_schedule (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  session_duration_minutes integer not null check (session_duration_minutes > 0)
);

create table blocked_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time,
  end_time time,
  reason text not null default ''
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_whatsapp text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'agendado' check (status in ('agendado', 'cancelado', 'reagendado')),
  payment_status text not null default 'pendente' check (payment_status in ('pago', 'pendente')),
  amount_cents integer not null default 0,
  created_at timestamptz not null default now()
);

-- Garante, a nível de banco, que não existam dois agendamentos ativos
-- para o mesmo horário (mesma checagem que lib/data/appointments.ts faz em
-- memória: qualquer status diferente de 'cancelado' — incluindo
-- 'reagendado' — ocupa o horário).
create unique index appointments_date_start_time_active_idx
  on appointments (date, start_time)
  where status <> 'cancelado';

-- Row Level Security: sem isso, qualquer tabela do Supabase fica acessível
-- via PostgREST usando a anon key, que é pública (vai no bundle do client).
-- Sem policies, RLS habilitado bloqueia todo acesso por padrão até que
-- policies explícitas sejam criadas.
alter table weekly_schedule enable row level security;
alter table blocked_slots enable row level security;
alter table appointments enable row level security;

-- Fase 2 TODO: adicionar policies antes de usar em produção.
-- Sugestão: appointments permite "insert" público (pacientes agendam sem
-- login) mas "select"/"update"/"delete" só para o usuário autenticado
-- (a psicóloga). weekly_schedule e blocked_slots: leitura pública (o
-- /agendar precisa calcular disponibilidade), escrita só autenticada.
