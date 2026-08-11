import type { Metadata } from 'next';
import { Inter, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';

import { Header } from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import Providers from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spline = Spline_Sans_Mono({
  variable: '--font-spline',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Saldu - Personal Financial Management',
  description: 'Gerencie suas finanças de forma premium e eficiente.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-theme="dark" className={`${inter.variable} ${spline.variable}`}>
      <body className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
        <Providers>
          <AuthProvider>
            <Header />
            <main className="mt-16 flex-1">{children}</main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
