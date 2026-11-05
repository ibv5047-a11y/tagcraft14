import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSql } from '@/lib/db';
import { createSession } from '@/lib/session';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) {
    return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
  }

  try {
    const sql = getSql();
    const rows = await sql`select id, email, password_hash from users where email = ${email}`;
    const user = rows[0];
    const ok = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!ok) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }
    await createSession(user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('login failed', err);
    return NextResponse.json({ error: 'Could not log you in. Try again.' }, { status: 500 });
  }
}
