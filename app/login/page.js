import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthForm from '@/components/AuthForm';
import { getSession } from '@/lib/session';

export const metadata = { title: 'Log in | TagCraft' };

export default async function LoginPage() {
  if (await getSession()) redirect('/dashboard');
  return (
    <>
      <Header />
      <main className="wrap page-narrow">
        <AuthForm mode="login" />
      </main>
      <Footer />
    </>
  );
}
