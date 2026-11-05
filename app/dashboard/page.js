import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Generator from './Generator';
import { getSession } from '@/lib/session';

export const metadata = { title: 'Dashboard | TagCraft' };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <>
      <Header />
      <main className="wrap page-wide">
        <h1 className="dash-title">Write a listing</h1>
        <p className="dash-sub">Signed in as {session.email}</p>
        <Generator />
      </main>
      <Footer />
    </>
  );
}
