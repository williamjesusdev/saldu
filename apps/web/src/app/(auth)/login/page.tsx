'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthForm, LoginFormData } from '@/components/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/apiClient';
import { AlertMessage } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);

  const handleSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      const userData = await login(data.email, data.password);
      setMessage({ type: 'success', text: 'Login efetuado com sucesso! Redirecionando...' });
      router.push(userData.hasConsented ? '/dashboard' : '/consent');
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

        {/* Forgot password link — above the form for UX */}
        <div className="mb-2 flex justify-end">
          <Link
            data-testid="forgotPasswordLink"
            href="/forgot-password"
            className="text-xs text-emerald-400 hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <AuthForm mode="login" onSubmit={handleSubmit} isLoading={loading} />

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
