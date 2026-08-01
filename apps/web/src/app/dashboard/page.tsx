'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'PLATFORM_ADMIN';

  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
              Dashboard
            </h1>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  data-testid="invitesLink"
                  href="/admin/invites"
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  Convites (Admin)
                </Link>
              )}
              <Link
                data-testid="settingsLink"
                href="/settings"
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
            </div>
          </div>
          <p className="text-slate-400">
            {user?.name || 'Olá'}, Bem-vindo à sua área logada (O motor financeiro será implementado
            na próxima versão).
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
