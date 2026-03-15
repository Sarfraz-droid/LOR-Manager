import type {Metadata, Viewport} from 'next';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const headlineFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-headline',
  display: 'swap',
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LoR Tracker Pro - Manage Your Letters of Recommendation',
  description: 'A professional platform for university students to track and organize Letters of Recommendation from professors.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var doc = document.documentElement;
                  var stored = localStorage.getItem('theme-mode');
                  var useLight = stored === 'light';

                  doc.classList.remove('light', 'dark');
                  doc.classList.add(useLight ? 'light' : 'dark');
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${headlineFont.variable} ${bodyFont.variable} font-body`}>{children}<Analytics /></body>
    </html>
  );
}