import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UpgradeButton from '@/components/UpgradeButton';
import Generator from './Generator';
import { getSession } from '@/lib/session';
import { getUsage } from '@/lib/usage';
import { confirmCheckout } from '@/lib/billing';

export const metadata = { title: 'Dashboard | TagCraft' };

export default async function DashboardPage({ searchParams }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const params = await searchParams;
  let justUpgraded = false;
  if (params && params.session_id) {
    justUpgraded = await confirmCheckout(params.session_id, session.id);
  }

  const { plan, used, limit } = await getUsage(session.id);

  return (
    <>
      <Header />
      <main className="wrap page-wide">
        <h1 className="dash-title">Write a listing</h1>
        <p className="dash-sub">Signed in as {session.email}</p>

        {justUpgraded && (
          <p className="notice" role="status">You are on Pro now. Thanks for subscribing.</p>
        )}

        <div className="card plan-bar">
          <p>
            <strong>{plan === 'pro' ? 'Pro plan' : 'Free plan'}:</strong>{' '}
            {used} of {limit} listings used this month
          </p>
          {plan === 'free' && <UpgradeButton />}
        </div>

        <Generator />
      </main>
      <Footer />
    </>
  );
}
