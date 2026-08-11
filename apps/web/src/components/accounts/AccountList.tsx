import { Archive, ArrowRight, Ban, Landmark, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { AccountResponse } from '@/types/api';

interface Props {
  accounts: AccountResponse[];
  onArchive?: (id: string) => void;
  archivingId?: string | null;
}

export function AccountList({ accounts, onArchive, archivingId }: Readonly<Props>) {
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const logoList = ['BB', 'ITAU', 'NUBANK'];
  const typeMap: Record<string, string> = {
    CHECKING: 'Conta Corrente',
    SAVINGS: 'Conta Poupança',
    INVESTMENT: 'Conta de Investimento',
  };

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center backdrop-blur-md">
        <Landmark className="mb-4 h-12 w-12 text-slate-500" />
        <p className="text-sm text-slate-400">Nenhuma conta encontrada.</p>
        <Link
          href="/accounts/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500"
        >
          <Plus className="h-4 w-4" />
          Criar Conta
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const logoName = logoList[logoList.indexOf(account.institution)] || 'OTHER';
        const isConfirming = confirmArchiveId === account.id;

        return (
          <li
            key={account.id}
            className="col-span-1 flex flex-col divide-y divide-slate-800/50 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md transition hover:border-slate-700"
          >
            <div className="flex w-full flex-1 items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3
                    data-testid="accountName"
                    className="truncate text-sm font-semibold text-slate-100"
                  >
                    {account.name}
                  </h3>
                  {account.ignoreInTotals && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-xs font-medium text-slate-300">
                      <Ban className="h-3 w-3" />
                      Ignorada
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {typeMap[account.type] || 'Conta Corrente'}
                </p>
                <p className="mt-4 text-xl font-bold tracking-tight text-slate-100">
                  <span className="text-sm font-medium text-slate-400">R$ </span>
                  {account.initialBalance.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="-mt-8 flex shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 p-2 shadow-inner">
                  <Image
                    src={`/banks/${logoName}.svg`}
                    alt={`${account.institution} logo`}
                    className="rounded-lg object-contain"
                    width={32}
                    height={32}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-slate-800/50">
                <div className="flex w-0 flex-1">
                  <Link
                    href={`/accounts/${account.id}`}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-bl-2xl border border-transparent py-4 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-emerald-400"
                  >
                    Detalhes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                {onArchive && (
                  <div className="-ml-px flex w-0 flex-1">
                    {isConfirming ? (
                      <div className="flex w-full items-center justify-center gap-2 px-2">
                        <button
                          type="button"
                          data-testid="btnConfirmArchive"
                          onClick={() => {
                            onArchive(account.id);
                          }}
                          disabled={archivingId === account.id}
                          className="flex-1 rounded-lg bg-rose-500/20 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/30 disabled:opacity-50"
                        >
                          {archivingId === account.id ? 'Arquivando...' : 'Confirmar'}
                        </button>
                        <button
                          type="button"
                          data-testid="btnCancelArchive"
                          onClick={() => setConfirmArchiveId(null)}
                          disabled={archivingId === account.id}
                          className="flex-1 rounded-lg bg-slate-700 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-600 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        data-testid="btnArchive"
                        onClick={() => setConfirmArchiveId(account.id)}
                        disabled={archivingId === account.id}
                        className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-br-2xl border border-transparent py-4 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-rose-400 disabled:opacity-50"
                      >
                        <Archive className="h-4 w-4" />
                        Arquivar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
