import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const RULES = {
  Etsy: { titleMax: 140, tagMax: 20, tagCount: 13 },
  'Other ecommerce': { titleMax: 150, tagMax: 30, tagCount: 15 },
};

function clipTitle(title, max) {
  if (title.length <= max) return title;
  const cut = title.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(','), cut.lastIndexOf(' '));
  return (stop > max * 0.6 ? cut.slice(0, stop) : cut).replace(/[,\s]+$/, '');
}

function parseModelJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in model output');
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Log in to generate listings.' }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return NextResponse.json({ error: 'The generator is not configured yet.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const product = String(body.product || '').trim();
  const platform = RULES[body.platform] ? body.platform : 'Etsy';
  const rules = RULES[platform];

  if (product.length < 10) {
    return NextResponse.json({ error: 'Describe your product in a sentence or two.' }, { status: 400 });
  }
  if (product.length > 1500) {
    return NextResponse.json({ error: 'Keep the product description under 1,500 characters.' }, { status: 400 });
  }

  const system = [
    `You write search-optimized product listings for ${platform} sellers.`,
    'Respond with ONLY a JSON object, no markdown and no extra text, in this shape:',
    '{"title": string, "tags": string[], "description": string}',
    `Rules: title is at most ${rules.titleMax} characters and leads with the most searched phrase.`,
    `Give exactly ${rules.tagCount} tags, each at most ${rules.tagMax} characters, lowercase, no duplicates, mixing specific and broader phrases buyers type.`,
    'The description is plain text, 120 to 200 words, readable by a shopper first and a search engine second.',
    'Only use facts present in the seller\'s product details. Do not invent materials, sizes, or claims.',
  ].join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: `Product details:\n${product}` }],
      }),
    });

    if (!res.ok) {
      console.error('anthropic error', res.status, await res.text());
      return NextResponse.json({ error: 'The AI service had a problem. Try again.' }, { status: 502 });
    }

    const data = await res.json();
    const text = (data.content || []).map((b) => (b.type === 'text' ? b.text : '')).join('');
    const parsed = parseModelJson(text);

    const title = clipTitle(String(parsed.title || '').trim(), rules.titleMax);
    const seen = new Set();
    const tags = (Array.isArray(parsed.tags) ? parsed.tags : [])
      .map((t) => String(t).trim().toLowerCase())
      .filter((t) => t && t.length <= rules.tagMax && !seen.has(t) && seen.add(t))
      .slice(0, rules.tagCount);
    const description = String(parsed.description || '').trim();

    if (!title || !description) throw new Error('Incomplete model output');
    return NextResponse.json({ title, tags, description });
  } catch (err) {
    console.error('generate failed', err);
    return NextResponse.json({ error: 'Could not generate a listing. Try again.' }, { status: 500 });
  }
}
