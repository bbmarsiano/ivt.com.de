import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { Providers } from '@/components/Providers';
import { HeaderWithMenus } from '@/components/layout/HeaderWithMenus';
import { FooterWithMenus } from '@/components/layout/FooterWithMenus';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const defaultTitle = 'Innovation Valley Thüringen';
const defaultDescription =
  'Innovation hub connecting projects, partners and resources in Thuringia.';

// Quick OG verification:
// curl -s http://localhost:3000 | rg 'property="og:image"|name="twitter:image"'
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: defaultTitle,
    template: `%s | ${defaultTitle}`,
  },
  description: defaultDescription,
  openGraph: {
    type: 'website',
    siteName: defaultTitle,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: '/og.png',
        width: 883,
        height: 372,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/og.png'],
  },
  icons: {
    icon: '/brand/ivt/IVT_Icon@3x.png',
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
          <div className="relative min-h-screen">
            {/* Fixed global background (content scrolls over it) */}
            <div className="pointer-events-none fixed inset-0 -z-40 bg-gradient-to-b from-[#050507] via-[#120008] to-[#2a0010]" />
            <div className="pointer-events-none fixed inset-0 -z-35 opacity-40 bg-tactical-grid" />
            <div className="pointer-events-none fixed inset-0 -z-30 opacity-30">
              <Image
                src="/brand/background_imgs/ivt_3.png"
                alt=""
                fill
                className="object-cover object-bottom"
              />
            </div>
            <div className="pointer-events-none fixed inset-0 -z-20 bg-vignette" />
            <div className="relative z-10 flex min-h-screen flex-col">
              <HeaderWithMenus />
              <main className="flex-1">{children}</main>
              <FooterWithMenus />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
