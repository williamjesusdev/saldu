'use client';

import { CheckCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthGuard } from '@/components/AuthGuard';
import { fetchApi } from '@/lib/apiClient';

export default function ConsentPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleConsent = async () => {
    setLoading(true);
    try {
      await fetchApi('/api/v1/users/me/consent', {
        method: 'POST',
      });

      setSubmitted(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Termos de Uso & Consentimento LGPD
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Sua privacidade é prioridade absoluta no Saldu.
            </p>
          </div>

          {submitted && (
            <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-6 text-center">
              <CheckCircle className="mx-auto mb-2 h-12 w-12 text-emerald-400" />
              <h2 className="text-lg font-semibold text-emerald-300">Consentimento Registrado!</h2>
              <p className="mt-1 text-sm text-slate-400">
                Obrigado por confirmar seus termos. Você já pode utilizar a plataforma com total
                segurança.
              </p>
            </div>
          )}

          {!submitted && (
            <div className="space-y-4">
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Resumo dos Termos de Privacidade:</p>
                <p>
                  1. <strong>Isolamento de Dados (Multi-Tenant)</strong>: Todos os seus registros
                  financeiros são isolados via Row-Level Security (RLS) e encriptados.
                </p>
                <p>
                  2. <strong>Uso Exclusivo de Dados</strong>: O Saldu não compartilha seus dados
                  financeiros com terceiros sob nenhuma circunstância.
                </p>
                <p>
                  3. <strong>Direito de Exclusão (Soft Delete & Exclusão Total)</strong>: Você pode
                  solicitar a remoção de seus dados a qualquer momento na aba de perfil.
                </p>
              </div>

              <label
                htmlFor="chkConsent"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 transition hover:border-slate-700"
              >
                <input
                  id="chkConsent"
                  data-testid="chkConsent"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded accent-emerald-500"
                />
                <span className="text-xs text-slate-300">
                  Li e concordo com o processamento dos meus dados conforme a LGPD e os Termos de
                  Uso.
                </span>
              </label>

              <button
                id="btnConsent"
                type="button"
                data-testid="btnConsent"
                onClick={handleConsent}
                disabled={!accepted || loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Confirmar & Continuar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
