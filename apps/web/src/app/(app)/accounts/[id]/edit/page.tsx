'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { EditAccountForm, EditAccountFormData } from '@/components/accounts';
import { fetchApi, getErrorMessage } from '@/lib/apiClient';
import { AccountResponse, AlertMessage } from '@/types/api';

export default function EditAccountPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [message, setMessage] = useState<AlertMessage | null>(null);

  const {
    data: account,
    isLoading: isFetching,
    error,
  } = useQuery({
    queryKey: ['account', id],
    queryFn: () => fetchApi<AccountResponse>(`/api/v1/accounts/${id}`),
    enabled: !!id,
  });

  const updateAccountMutation = useMutation({
    mutationFn: (data: EditAccountFormData) => {
      return fetchApi(`/api/v1/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onMutate: () => {
      setMessage(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account', id] });
      router.push(`/accounts/${id}?status=updated`);
    },
    onError: (err) => {
      setMessage({ type: 'error', text: `Erro ao atualizar conta: ${err.message}` });
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <Link
            href={`/accounts/${id}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Detalhes
          </Link>
          <h2 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-2xl/7 font-bold text-transparent sm:truncate sm:text-3xl sm:tracking-tight">
            Editar Conta
          </h2>
        </div>
      </div>

      {message && (
        <div className="mx-auto mb-6 flex max-w-2xl items-start gap-3 rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {isFetching && (
        <div className="flex justify-center py-10">
          <p className="text-slate-400">Carregando dados da conta...</p>
        </div>
      )}
      {!isFetching && error && (
        <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Erro ao carregar conta</h3>
            <p className="mt-1">{getErrorMessage(error, 'Ocorreu um erro desconhecido.')}</p>
          </div>
        </div>
      )}
      {!isFetching && !error && account && (
        <EditAccountForm
          initialData={account}
          onSubmit={(data) => updateAccountMutation.mutate(data)}
          isLoading={updateAccountMutation.isPending}
        />
      )}
    </div>
  );
}
