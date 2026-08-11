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
-- para o mesmo horário (mesma checagem que lib/data/appointments.ts
-- faz em memória).
create unique index appointments_date_start_time_active_idx
  on appointments (date, start_time)
  where status = 'agendado';
