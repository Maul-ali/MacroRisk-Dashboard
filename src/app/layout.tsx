import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FI MacroRisk Radar — Fertilizer Indo Macro Intelligence',
  description:
    'Executive macro-risk dashboard for fertilizer industry strategy. Live data from 10 sources across 17 indicators. Powered by MaxAI.',
  keywords: [
    'fertilizer',
    'macro risk',
    'commodity dashboard',
    'energy',
    'FX',
    'Indonesia',
  ],
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('fi_theme_mode');
      if (saved === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased bg-bg-primary text-text-primary selection:bg-chart-1/30 selection:text-text-primary">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
