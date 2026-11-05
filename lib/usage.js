import { getSql } from '@/lib/db';

export const LIMITS = { free: 3, pro: 100 };

// Plan and number of listings generated this calendar month.
export async function getUsage(userId) {
  const sql = getSql();
  const rows = await sql`
    select u.plan,
      (select count(*) from generations g
        where g.user_id = u.id and g.created_at >= date_trunc('month', now())) as used
    from users u
    where u.id = ${userId}
  `;
  const row = rows[0];
  const plan = row && row.plan === 'pro' ? 'pro' : 'free';
  return { plan, used: Number((row && row.used) || 0), limit: LIMITS[plan] };
}

export async function recordGeneration(userId) {
  const sql = getSql();
  await sql`insert into generations (user_id) values (${userId})`;
}
