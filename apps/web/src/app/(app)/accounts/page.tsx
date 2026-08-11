'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AccountList } from '@/components/accounts';
import { fetchApi, getErrorMessage } from '@/lib/apiClient';
import { AccountResponse, AlertMessage } from '@/types/api';

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const getInitialMessage = (): AlertMessage | null => {
    if (status === 'created') return { type: 'success', text: 'Conta criada com sucesso.' };
    if (status === 'archived') return { type: 'success', text: 'Conta arquivada com sucesso.' };
    return null;
  };

  const [message, setMessage] = useState<AlertMessage | null>(getInitialMessage());

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => fetchApi<AccountResponse[]>('/api/v1/accounts'),
  });

  const archiveAccountMutation = useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/accounts/${id}`, {
        method: 'DELETE',
      });
    },
    onMutate: (id) => {
      setArchivingId(id);
      setMessage(null);
    },
    onSettled: () => {
      setArchivingId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setMessage({ type: 'success', text: 'Conta arquivada com sucesso.' });
    },
    onError: (err) => {
      setMessage({ type: 'error', text: `Erro ao arquivar conta: ${err.message}` });
    },
  });

  const handleArchive = (id: string) => {
    archiveAccountMutation.mutate(id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-2xl/7 font-bold text-transparent sm:truncate sm:text-3xl sm:tracking-tight">
            Contas Bancárias
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/accounts/new"
            className="ml-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 focus:outline-none"
          >
            <Plus className="h-4 w-4" />
            Nova Conta
          </Link>
        </div>
      </div>
      {message && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-emerald-800 bg-emerald-950/50 text-emerald-300'
              : 'border-rose-800 bg-rose-950/50 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center py-10">
          <p className="text-slate-400">Carregando contas...</p>
        </div>
      )}
      {!isLoading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Erro ao carregar contas</h3>
            <p className="mt-1">{getErrorMessage(error, 'Ocorreu um erro desconhecido.')}</p>
          </div>
        </div>
      )}{' '}
      {!isLoading && !error && accounts && (
        <AccountList accounts={accounts} onArchive={handleArchive} archivingId={archivingId} />
      )}
    </div>
  );
}
