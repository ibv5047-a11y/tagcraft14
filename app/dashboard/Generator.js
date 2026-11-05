'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }
  return (
    <button type="button" className="link-button" onClick={copy}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function Generator() {
  const router = useRouter();
  const [product, setProduct] = useState('');
  const [platform, setPlatform] = useState('Etsy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult(data);
      router.refresh(); // updates the "listings used" count
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dash-grid">
      <form onSubmit={onSubmit} className="card stack">
        <label className="field-label" htmlFor="product">Describe your product</label>
        <textarea
          id="product"
          rows={7}
          required
          maxLength={1500}
          placeholder="Handmade blue stoneware coffee mug, speckled glaze, holds 12 oz, dishwasher safe, wheel thrown."
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
        <label className="field-label" htmlFor="platform">Where will you sell it?</label>
        <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option>Etsy</option>
          <option>Other ecommerce</option>
        </select>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Writing your listing...' : 'Generate listing'}
        </button>
      </form>

      <section className="card stack" aria-live="polite">
        {!result && !loading && (
          <p className="hint">Your title, tags, and description will appear here.</p>
        )}
        {loading && <p className="hint">Writing your listing...</p>}
        {result && (
          <>
            <div>
              <div className="result-head">
                <h2>Title</h2>
                <CopyButton text={result.title} />
              </div>
              <p className="result-title">{result.title}</p>
              <p className="hint">{result.title.length} characters</p>
            </div>
            <div>
              <div className="result-head">
                <h2>Tags</h2>
                <CopyButton text={result.tags.join(', ')} />
              </div>
              <ul className="tags" aria-label="Suggested tags">
                {result.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="result-head">
                <h2>Description</h2>
                <CopyButton text={result.description} />
              </div>
              <p className="result-desc">{result.description}</p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
