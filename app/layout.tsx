import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { HeaderWithMenus } from '@/components/layout/HeaderWithMenus';
import { FooterWithMenus } from '@/components/layout/FooterWithMenus';
import { CmsSourceBadge } from '@/components/CmsSourceBadge';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

import { getSiteUrl } from '@/lib/env';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Innovation Valley Thüringen',
  description: 'Where Innovation Meets Tradition - Innovation Valley Thuringia',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <HeaderWithMenus />
            <main className="flex-1">{children}</main>
            <FooterWithMenus />
          </div>
          <CmsSourceBadge />
        </Providers>
      </body>
    </html>
  );
}
