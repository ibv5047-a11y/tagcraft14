-- Run this once in the Neon SQL Editor (after the original schema.sql).
alter table users add column if not exists plan text not null default 'free';
alter table users add column if not exists stripe_customer_id text;
alter table users add column if not exists stripe_subscription_id text;

create table if not exists generations (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_month on generations (user_id, created_at);
