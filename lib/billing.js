import { getSql } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export async function setPro(userId, customerId, subscriptionId) {
  const sql = getSql();
  await sql`
    update users
    set plan = 'pro', stripe_customer_id = ${customerId}, stripe_subscription_id = ${subscriptionId}
    where id = ${userId}
  `;
}

// Called when Stripe sends the customer back to the dashboard after paying.
// Checks with Stripe directly, so it works even before the webhook arrives.
export async function confirmCheckout(checkoutSessionId, userId) {
  try {
    const stripe = getStripe();
    const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (cs.client_reference_id !== String(userId)) return false;
    if (cs.status !== 'complete' || !cs.subscription) return false;

    const sub = await stripe.subscriptions.retrieve(cs.subscription);
    if (!['active', 'trialing'].includes(sub.status)) return false;

    await setPro(userId, cs.customer, sub.id);
    return true;
  } catch (err) {
    console.error('confirmCheckout failed', err);
    return false;
  }
}
