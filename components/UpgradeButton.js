'use client';

import { useState } from 'react';

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout.');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="button" type="button" onClick={startCheckout} disabled={loading}>
        {loading ? 'Opening checkout...' : 'Upgrade to Pro, $12/month'}
      </button>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
