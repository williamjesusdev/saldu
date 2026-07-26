import type { Metadata } from 'next';
import { Inter, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="dark" className={`${inter.variable} ${spline.variable}`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
