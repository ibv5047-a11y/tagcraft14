import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Log in first.' }, { status: 401 });
  }
  if (!process.env.STRIPE_PRICE_ID) {
    console.error('STRIPE_PRICE_ID is not set');
    return NextResponse.json({ error: 'Payments are not set up yet.' }, { status: 500 });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      select email, plan, stripe_customer_id from users where id = ${session.id}
    `;
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 401 });
    }
    if (user.plan === 'pro') {
      return NextResponse.json({ error: 'You are already on Pro.' }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: String(session.id),
      ...(user.stripe_customer_id
        ? { customer: user.stripe_customer_id }
        : { customer_email: user.email }),
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('checkout failed', err);
    return NextResponse.json({ error: 'Could not start checkout. Try again.' }, { status: 500 });
  }
}
