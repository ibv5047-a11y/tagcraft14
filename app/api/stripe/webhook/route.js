import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { setPro } from '@/lib/billing';

// Stripe calls this URL when a subscription starts, renews, fails or is cancelled.
export async function POST(request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  const body = await request.text(); // raw body is required to verify the signature

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('webhook signature check failed', err.message);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const cs = event.data.object;
      if (cs.mode === 'subscription' && cs.client_reference_id && cs.subscription) {
        await setPro(cs.client_reference_id, cs.customer, cs.subscription);
      }
    } else if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object;
      const plan = ['active', 'trialing'].includes(sub.status) ? 'pro' : 'free';
      const sql = getSql();
      await sql`update users set plan = ${plan} where stripe_subscription_id = ${sub.id}`;
    }
  } catch (err) {
    console.error('webhook handling failed', err);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
