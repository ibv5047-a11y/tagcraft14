import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSql } from '@/lib/db';
import { createSession } from '@/lib/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: 'Password must be 8 to 72 characters.' }, { status: 400 });
  }

  try {
    const sql = getSql();
    const hash = await bcrypt.hash(password, 10);
    const rows = await sql`
      insert into users (email, password_hash)
      values (${email}, ${hash})
      returning id, email
    `;
    await createSession(rows[0]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err && err.code === '23505') {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }
    console.error('signup failed', err);
    return NextResponse.json({ error: 'Could not create your account. Try again.' }, { status: 500 });
  }
}
