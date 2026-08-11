'use client';

import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <div className="h-3 w-3 rounded-full bg-slate-950" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-100">
            Saldu
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-slate-300 transition-colors hover:text-emerald-400"
              >
                Dashboard
              </Link>
              <Link
                href="/accounts"
                className="text-sm font-semibold text-slate-300 transition-colors hover:text-emerald-400"
                data-testid="accountsHeaderLink"
              >
                Contas
              </Link>
              {user?.role === 'PLATFORM_ADMIN' && (
                <Link
                  href="/admin/invites"
                  className="text-sm font-semibold text-slate-300 transition-colors hover:text-emerald-400"
                >
                  Convites
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-sm font-semibold text-rose-400 transition-colors hover:text-rose-300"
                data-testid="btnLogout"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 transition-colors hover:text-emerald-400"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-95"
              >
                Começar grátis
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
