'use client';

import { AuthGuard } from '@/components/AuthGuard';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuard>{children}</AuthGuard>;
}
