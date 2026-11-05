import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
});
const body = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata = {
  title: 'TagCraft: SEO titles, tags, and descriptions for Etsy and ecommerce listings',
  description:
    'TagCraft uses AI to write search-optimized titles, tags, and descriptions for your Etsy and ecommerce product listings.',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
