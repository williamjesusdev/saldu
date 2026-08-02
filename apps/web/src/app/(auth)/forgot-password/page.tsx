'use client';

import { AlertCircle, CheckCircle, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubmitEvent, Suspense, useEffect, useState } from 'react';

import { fetchApi, getErrorMessage, getSuccessMessage } from '@/lib/apiClient';
import { AlertMessage, MessageResponse } from '@/types/api';

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const isResetMode = Boolean(token);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [emailParam, tokenParam]);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isResetMode) {
        const data = await fetchApi<MessageResponse>('/api/v1/auth/password/reset/verify', {
          method: 'POST',
          body: JSON.stringify({ email, token, password }),
        });
        setMessage({
          type: 'success',
          text: getSuccessMessage(data, 'Senha redefinida com sucesso.'),
        });
        setTimeout(() => {
          router.push('/login');
        }, 500);
      } else {
        const data = await fetchApi<MessageResponse>('/api/v1/auth/password/reset', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        setMessage({
          type: 'success',
          text: getSuccessMessage(
            data,
            'Se o e-mail existir em nossa base, você receberá o link de recuperação.',
          ),
        });
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Erro ao conectar com o servidor.');
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
            >
              E-mail cadastrado
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                data-testid="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {isResetMode && (
            <>
              <div>
                <label
                  htmlFor="token"
                  className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                  Token de Recuperação
                </label>
                <input
                  id="token"
                  data-testid="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Token de verificação"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    data-testid="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres (1 maiúscula, 1 número)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <button
            data-testid="btnSubmit"
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
          >
            {loading && 'Enviando...'}
            {!loading && (isResetMode ? 'Redefinir Senha' : 'Enviar E-mail de Recuperação')}
          </button>
        </form>

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
      <ForgotPasswordForm />
    </Suspense>
  );
}
