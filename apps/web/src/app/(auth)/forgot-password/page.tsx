'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { ForgotPasswordForm, ForgotPasswordFormData } from '@/components/auth';
import { fetchApi, getErrorMessage, getSuccessMessage } from '@/lib/apiClient';
import { AlertMessage, MessageResponse } from '@/types/api';

function ForgotPasswordWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [isResetMode, setIsResetMode] = useState(Boolean(tokenParam));

  useEffect(() => {
    if (tokenParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsResetMode(true);
    }
  }, [tokenParam]);

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      let uri = '/api/v1/auth/password/reset';
      let successMessage =
        'Se o e-mail existir em nossa base, você receberá o link de recuperação.';

      if (isResetMode) {
        uri = '/api/v1/auth/password/reset/verify';
        successMessage = 'Senha redefinida com sucesso. Redirecionando para o login...';
      }

      const res = await fetchApi<MessageResponse>(uri, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setMessage({ type: 'success', text: getSuccessMessage(res, successMessage) });

      if (isResetMode) {
        setTimeout(() => {
          router.push('/login');
        }, 500);
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Ocorreu um erro ao processar a solicitação.');
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent">
            {isResetMode ? 'Redefinir Senha' : 'Recuperar Senha'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isResetMode
              ? 'Informe sua nova senha para concluir a redefinição.'
              : 'Digite seu e-mail cadastrado para receber as instruções de recuperação.'}
          </p>
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
            <span data-testid="messageSpan">{message.text}</span>
          </div>
        )}

        <ForgotPasswordForm
          mode={isResetMode ? 'reset' : 'request'}
          onSubmit={handleSubmit}
          isLoading={loading}
          initialEmail={emailParam}
          initialToken={tokenParam}
        />

        <div className="mt-6 text-center text-xs text-slate-500">
          Lembrou a senha?{' '}
          <Link href="/login" className="font-medium text-emerald-400 hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <ForgotPasswordWrapper />
    </Suspense>
  );
}
