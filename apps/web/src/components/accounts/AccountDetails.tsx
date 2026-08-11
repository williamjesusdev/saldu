import { Archive, Ban, Edit2, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { AccountResponse } from '@/types/api';

interface Props {
  account: AccountResponse;
  onArchive?: () => void;
  isArchiving?: boolean;
}

export function AccountDetails({ account, onArchive, isArchiving = false }: Readonly<Props>) {
  const [confirmArchive, setConfirmArchive] = useState(false);

  const logoList = ['BB', 'ITAU', 'NUBANK'];
  const typeMap: Record<string, string> = {
    CHECKING: 'Conta Corrente',
    SAVINGS: 'Conta Poupança',
    INVESTMENT: 'Conta de Investimento',
  };

  const logoName = logoList[logoList.indexOf(account.institution)] || 'OTHER';

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col justify-between border-b border-slate-800/50 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-100">{account.name}</h3>
          <p className="mt-2 text-sm text-slate-400">
            {account.institution} &bull; {typeMap[account.type] || 'Conta Corrente'}
          </p>
        </div>
        <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 p-3 shadow-inner sm:mt-0">
          <Image
            src={`/banks/${logoName}.svg`}
            alt={`${account.institution} logo`}
            className="rounded-lg object-contain"
            width={48}
            height={48}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Saldo Principal
            </dt>
            <dd
              data-testid="accountBalance"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-100"
            >
              <span className="text-lg font-medium text-slate-500">R$ </span>
              {account.initialBalance.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Limite Extra (Crédito)
            </dt>
            <dd
              data-testid="account-credit-limit"
              className="mt-2 text-3xl font-bold tracking-tight text-slate-100"
            >
              <span className="text-lg font-medium text-slate-500">R$ </span>
              {account.creditLimit.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Configurações
            </dt>
            <dd className="mt-3 flex flex-wrap gap-3">
              {account.ignoreInTotals ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300">
                  <Ban className="h-3.5 w-3.5" />
                  Ignorada nos Totais
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  Incluída nos Totais
                </span>
              )}

              {account.investmentAccount && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-800/50 bg-cyan-950/30 px-3 py-1.5 text-xs font-medium text-cyan-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Conta de Investimento
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-slate-800/50 bg-slate-950/30 p-6 sm:flex-row sm:p-8">
        {onArchive &&
          (confirmArchive ? (
            <div className="flex w-full items-center justify-center gap-3 sm:w-auto">
              <span className="text-sm font-medium text-slate-300">Arquivar conta?</span>
              <button
                type="button"
                data-testid="btnConfirmArchive"
                onClick={() => {
                  onArchive();
                }}
                className="rounded-xl bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/30 disabled:opacity-50"
                disabled={isArchiving}
              >
                {isArchiving ? 'Arquivando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                data-testid="btnCancelArchive"
                onClick={() => setConfirmArchive(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 disabled:opacity-50"
                disabled={isArchiving}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-testid="btnArchive"
              onClick={() => setConfirmArchive(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400 sm:w-auto"
            >
              <Archive className="h-4 w-4" />
              Arquivar Conta
            </button>
          ))}

        <Link
          href={`/accounts/${account.id}/edit`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 sm:w-auto"
        >
          <Edit2 className="h-4 w-4" />
          Editar
        </Link>
      </div>
    </div>
  );
}
