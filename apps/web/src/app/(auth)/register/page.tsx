'use client';

import { AlertCircle, CheckCircle, KeyRound, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubmitEvent, Suspense, useEffect, useState } from 'react';

import { fetchApi, getErrorMessage } from '@/lib/apiClient';
import { AccessRequestResponse, AlertMessage, UserResponse } from '@/types/api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [useToken, setUseToken] = useState(!!tokenParam);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    token: tokenParam,
  });

  useEffect(() => {
    if (tokenParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUseToken(true);
      setFormData((prev) => ({ ...prev, token: tokenParam }));
    }
  }, [tokenParam]);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (useToken) {
        await fetchApi<UserResponse>('/api/v1/auth/invite/accept', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        setMessage({
          type: 'success',
          text: 'Conta criada com sucesso! Redirecionando para o login...',
        });
        setTimeout(() => {
          router.push('/login');
        }, 500);
      } else {
        await fetchApi<AccessRequestResponse>('/api/v1/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        setMessage({
          type: 'success',
          text: 'Solicitação de cadastro enviada! Sua conta aguarda aprovação do administrador.',
        });
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
            >
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                id="name"
                data-testid="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Maria Silva"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                data-testid="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                data-testid="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres (1 maiúscula, 1 número)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              data-testid="btnUseToken"
              type="button"
              onClick={() => setUseToken(!useToken)}
              className="text-xs font-medium text-emerald-400 underline hover:text-emerald-300"
            >
              {useToken ? 'Não possui código de convite?' : 'Possui um código de convite?'}
            </button>
          </div>

          {useToken && (
            <div>
              <label
                htmlFor="token"
                className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
              >
                Código de Convite
              </label>
              <div className="relative">
                <KeyRound className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="token"
                  data-testid="token"
                  type="text"
                  required={useToken}
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder="Cole seu código de convite"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            data-testid="btnSubmit"
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
          >
            {!loading && useToken ? 'Aceitar Convite & Criar Conta' : 'Solicitar Acesso'}
            {loading && 'Processando...'}
          </button>
        </form>

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
      <RegisterForm />
    </Suspense>
  );
}
