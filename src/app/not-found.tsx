import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="app-domain">
      <main className="not-found-main">
        <div className="not-found-card capsule-body">
          <p className="not-found-code">404</p>
          <h2 className="not-found-title">Page not found</h2>
          <p className="not-found-sub">
            Looks like this booth doesn&apos;t exist.
          </p>
          <Link href="/" className="not-found-btn">
            Back to Open House
          </Link>
        </div>
      </main>
    </div>
  );
}
