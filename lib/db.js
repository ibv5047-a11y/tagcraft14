import { neon } from '@neondatabase/serverless';

// Created lazily so the app can build before DATABASE_URL is set.
export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(process.env.DATABASE_URL);
}
