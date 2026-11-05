-- Run this once in the Neon SQL Editor.
create table if not exists users (
  id bigserial primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);
