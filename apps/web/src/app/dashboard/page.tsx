'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CreditCard,
  Landmark,
  PlusCircle,
  Settings,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/apiClient';
import { AccountResponse } from '@/types/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'PLATFORM_ADMIN';

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => fetchApi<AccountResponse[]>('/api/v1/accounts'),
  });

  const activeAccounts = accounts ?? [];
  const totalBalance = activeAccounts
    .filter((acc) => !acc.ignoreInTotals)
    .reduce((sum, acc) => sum + (acc.initialBalance ?? 0), 0);

  const investmentCount = activeAccounts.filter(
    (acc) => acc.type === 'INVESTMENT' || acc.investmentAccount,
  ).length;

  const checkingCount = activeAccounts.filter((acc) => acc.type === 'CHECKING').length;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              Olá, {user?.name || 'Bem-vindo'} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Acompanhe seu resumo financeiro e gerencie suas contas Saldu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link
                data-testid="invitesLink"
                href="/admin/invites"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-md transition hover:border-slate-600 hover:bg-slate-700"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Convites (Admin)
              </Link>
            )}
            <Link
              data-testid="settingsLink"
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-md transition hover:border-slate-600 hover:bg-slate-700"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Configurações
            </Link>
          </div>
        </div>

        {/* Financial Metrics Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Saldo Total Consolidado
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-100">
              {isLoading ? (
                <span className="text-sm font-normal text-slate-500">Carregando...</span>
              ) : (
                `R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              )}
            </p>
            <p className="mt-1 text-xs text-slate-400">Desconsiderando contas ignoradas</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:border-teal-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Contas Cadastradas
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-100">
              {isLoading ? (
                <span className="text-sm font-normal text-slate-500">...</span>
              ) : (
                activeAccounts.length
              )}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {checkingCount} corrente{checkingCount === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Investimentos
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-100">
              {isLoading ? (
                <span className="text-sm font-normal text-slate-500">...</span>
              ) : (
                investmentCount
              )}
            </p>
            <p className="mt-1 text-xs text-slate-400">Conta(s) de investimento</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:border-indigo-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Cartões & Limites
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-100">
              R${' '}
              {activeAccounts
                .reduce((sum, acc) => sum + (acc.creditLimit ?? 0), 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-slate-400">Limite de crédito total</p>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Manage Accounts Widget */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-950 p-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">Minhas Contas</h2>
                    <p className="text-xs text-slate-400">
                      Gerencie saldos, bancos e preferências de relatórios.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {isLoading && (
                  <p className="text-sm text-slate-500">Carregando lista de contas...</p>
                )}
                {error && <p className="text-sm text-rose-400">Erro ao carregar contas.</p>}
                {!isLoading && !error && activeAccounts.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Nenhuma conta cadastrada ainda. Crie sua primeira conta para começar!
                  </p>
                )}
                {!isLoading &&
                  activeAccounts.slice(0, 3).map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-slate-200">{account.name}</span>
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                          {account.institution}
                        </span>
                      </div>
                      <span className="font-mono font-medium text-emerald-400">
                        R${' '}
                        {(account.initialBalance ?? 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-slate-800/60 pt-4">
              <Link
                data-testid="accountsLink"
                href="/accounts"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
              >
                Ver Todas as Contas
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/accounts/new"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                <PlusCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts & Financial Info Widget */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-950 p-6 shadow-xl backdrop-blur-xl">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Atalhos Rápidos</h2>
              <p className="text-xs text-slate-400">
                Acesse rapidamente as funções principais do Saldu.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/accounts/new"
                  className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-emerald-500/40 hover:bg-slate-900"
                >
                  <PlusCircle className="h-6 w-6 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Nova Conta</h3>
                    <p className="text-xs text-slate-400">Cadastre um banco ou carteira</p>
                  </div>
                </Link>

                <Link
                  href="/accounts"
                  className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-teal-500/40 hover:bg-slate-900"
                >
                  <Landmark className="h-6 w-6 text-teal-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Gerenciar Contas</h3>
                    <p className="text-xs text-slate-400">Edite ou arquive suas contas</p>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900"
                >
                  <Settings className="h-6 w-6 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Configurações</h3>
                    <p className="text-xs text-slate-400">Senha e segurança da conta</p>
                  </div>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/invites"
                    className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-amber-500/40 hover:bg-slate-900"
                  >
                    <ShieldCheck className="h-6 w-6 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Gerenciar Convites</h3>
                      <p className="text-xs text-slate-400">Painel administrativo</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-xs text-emerald-300">
              💡 <strong>Dica Saldu:</strong> O módulo de lançamentos e cartões de crédito será
              integrado nos próximos ciclos para cálculo dinâmico de saldo.
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
