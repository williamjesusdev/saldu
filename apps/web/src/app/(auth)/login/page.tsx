'use client';

import { AlertCircle, CheckCircle, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmitEvent, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/apiClient';
import { AlertMessage } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const userData = await login(formData.email, formData.password);
      setMessage({ type: 'success', text: 'Login efetuado com sucesso! Redirecionando...' });
      router.push(userData.hasConsented ? '/dashboard' : '/consent');
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
          <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
            Acessar Saldu
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Entre para gerenciar suas finanças de forma inteligente.
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
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
              >
                Senha
              </label>
              <Link
                data-testid="forgotPasswordLink"
                href="/forgot-password"
                className="text-xs text-emerald-400 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                data-testid="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            data-testid="btnSubmit"
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Ainda não tem conta?{' '}
          <Link
            data-testid="registerLink"
            href="/register"
            className="font-medium text-emerald-400 hover:underline"
          >
            Solicitar acesso
          </Link>
        </div>
      </div>
    </div>
  );
}
