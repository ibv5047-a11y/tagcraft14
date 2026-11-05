import Link from 'next/link';
import { getSession } from '@/lib/session';

export default async function Header() {
  const session = await getSession();
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link className="brand" href="/" aria-label="TagCraft home">
          <span className="brand-mark" aria-hidden="true"></span>
          TagCraft
        </Link>
        <nav className="nav" aria-label="Account">
          {session ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="link-button">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link className="button button-small" href="/signup">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
