'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { AuthForm, RegisterFormData } from '@/components/auth';
import { fetchApi, getErrorMessage } from '@/lib/apiClient';
import { AccessRequestResponse, AlertMessage, UserResponse } from '@/types/api';

function RegisterFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [useToken, setUseToken] = useState(!!tokenParam);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);

  useEffect(() => {
    if (tokenParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUseToken(true);
    }
  }, [tokenParam]);

  const handleSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      let uri = '/api/v1/auth/register';
      let successMessage =
        'Solicitação de cadastro enviada! Sua conta aguarda aprovação do administrador.';

      if (useToken) {
        uri = '/api/v1/auth/invite/accept';
        successMessage = 'Conta criada com sucesso! Redirecionando para o login...';
      }

      await fetchApi<UserResponse | AccessRequestResponse>(uri, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setMessage({ type: 'success', text: successMessage });

      if (useToken) {
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
          <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
            Criar sua conta no Saldu
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestão financeira pessoal com privacidade e isolamento total.
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
            <span>{message.text}</span>
          </div>
        )}

        <AuthForm
          mode="register"
          onSubmit={handleSubmit}
          isLoading={loading}
          initialToken={tokenParam}
          showTokenField={useToken}
          onToggleToken={() => setUseToken((prev) => !prev)}
        />

        <div className="mt-6 text-center text-xs text-slate-500">
          Já possui conta?{' '}
          <Link href="/login" className="font-medium text-emerald-400 hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      }
    >
      <RegisterFormWrapper />
    </Suspense>
  );
}
