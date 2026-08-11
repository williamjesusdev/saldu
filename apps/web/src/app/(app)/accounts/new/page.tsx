'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateAccountForm, CreateAccountFormData } from '@/components/accounts';
import { fetchApi } from '@/lib/apiClient';
import { AlertMessage } from '@/types/api';

export default function CreateAccountPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [message, setMessage] = useState<AlertMessage | null>(null);

  const createAccountMutation = useMutation({
    mutationFn: (data: CreateAccountFormData) => {
      return fetchApi('/api/v1/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onMutate: () => {
      setMessage(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      router.push('/accounts?status=created');
    },
    onError: (error) => {
      setMessage({ type: 'error', text: `Erro ao criar conta: ${error.message}` });
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href="/accounts"
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Contas
          </Link>
          <h2 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-2xl/7 font-bold text-transparent sm:truncate sm:text-3xl sm:tracking-tight">
            Nova Conta
          </h2>
        </div>
      </div>

      {message && (
        <div className="mx-auto mb-6 flex max-w-2xl items-start gap-3 rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <CreateAccountForm
        onSubmit={(data) => createAccountMutation.mutate(data)}
        isLoading={createAccountMutation.isPending}
      />
    </div>
  );
}
