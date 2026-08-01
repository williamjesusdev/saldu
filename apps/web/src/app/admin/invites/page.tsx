'use client';

import { Check, ChevronLeft, ChevronRight, Copy, RefreshCw, UserPlus } from 'lucide-react';
import { SubmitEvent, useCallback, useEffect, useState } from 'react';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi, getErrorMessage } from '@/lib/apiClient';
import { InviteResponse, PageResponse } from '@/types/api';

export default function AdminInvitesPage() {
  const { isAuthenticated } = useAuth();

  // Invites state
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInvites = useCallback(
    async (page = 0, currentStatusFilter = statusFilter) => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          size: pageSize.toString(),
        });
        if (currentStatusFilter) {
          queryParams.append('status', currentStatusFilter);
        }

        const data = await fetchApi<PageResponse<InviteResponse>>(
          `/api/v1/admin/invites?${queryParams.toString()}`,
        );

        setInvites(data.content || []);
        if (data.page) {
          setPageNumber(data.page.number);
          setTotalPages(data.page.totalPages);
          setPageSize(data.page.size);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, statusFilter, isAuthenticated],
  );

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchInvites(0, statusFilter);
    }
  }, [fetchInvites, statusFilter, isAuthenticated]);

  const handleGenerateInvite = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi<InviteResponse>('/api/v1/admin/invites', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput }),
      });

      setInvites((prev) => [data, ...prev].slice(0, pageSize));
      setEmailInput('');
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Erro de conexão ao gerar o convite.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (tokenStr: string) => {
    navigator.clipboard.writeText(tokenStr);
    setCopiedToken(tokenStr);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
                Painel Admin: Gestão de Convites
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Gere links de convite direto para novos usuários.
              </p>
            </div>
            <button
              data-testid="btnRefresh"
              onClick={() => fetchInvites(pageNumber)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 transition hover:border-slate-700"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-200">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              Gerar Novo Código de Convite
            </h2>

            <form onSubmit={handleGenerateInvite} className="flex gap-4">
              <input
                data-testid="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="E-mail do convidado (opcional)"
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
              />
              <button
                data-testid="btnSubmit"
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                Gerar Convite
              </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">
                Tokens Emitidos ({invites.length})
              </h2>
              <select
                data-testid="selStatusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendentes</option>
                <option value="USED">Usados</option>
              </select>
            </div>

            {invites.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Nenhum token ativo no momento.</p>
            ) : (
              <>
                <div className="divide-y divide-slate-800">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between py-3">
                      <div>
                        <code className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-sm text-emerald-400">
                          {invite.token}
                        </code>
                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          {invite.email && <span>Para: {invite.email} • </span>}
                          Expira em: {new Date(invite.expiresAt).toLocaleString('pt-BR')}
                          {invite.used && (
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                              Usado
                            </span>
                          )}
                          {!invite.used && new Date() > new Date(invite.expiresAt) && (
                            <span className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400">
                              Expirado
                            </span>
                          )}
                          {!invite.used && (
                            <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-400">
                              Pendente
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        data-testid="btnCopy"
                        onClick={() => copyToClipboard(invite.token)}
                        className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700"
                      >
                        {copiedToken === invite.token ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 text-slate-400" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-sm text-slate-400">
                      Página {pageNumber + 1} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        data-testid="btnPrev"
                        onClick={() => fetchInvites(pageNumber - 1)}
                        disabled={pageNumber === 0 || loading}
                        className="flex h-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Anterior
                      </button>
                      <button
                        data-testid="btnNext"
                        onClick={() => fetchInvites(pageNumber + 1)}
                        disabled={pageNumber >= totalPages - 1 || loading}
                        className="flex h-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                      >
                        Próxima
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
