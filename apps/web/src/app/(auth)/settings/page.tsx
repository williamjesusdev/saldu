'use client';

import { AlertCircle, CheckCircle, Key, Shield, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SubmitEvent, useState } from 'react';

import { AuthGuard } from '@/components/AuthGuard';
import { fetchApi, getErrorMessage } from '@/lib/apiClient';
import { AlertMessage, MessageResponse } from '@/types/api';

export default function SettingsPage() {
  const router = useRouter();

  // Change Password State
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<AlertMessage | null>(null);

  // Delete Account State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<AlertMessage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      const data = await fetchApi<MessageResponse>('/api/v1/users/me/password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });

      setPasswordMessage({ type: 'success', text: data.message });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Erro ao atualizar a senha.');
      setPasswordMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteMessage(null);

    try {
      await fetchApi<unknown>('/api/v1/users/me', {
        method: 'DELETE',
      });

      await fetchApi<unknown>('/api/v1/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Erro ao excluir conta.');
      setDeleteMessage({ type: 'error', text: errorMsg });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
              Configurações da Conta
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Gerencie suas credenciais e privacidade de forma segura.
            </p>
          </div>

          {/* Change Password Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-semibold text-slate-100">Segurança</h2>
            </div>

            {passwordMessage && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                  passwordMessage.type === 'success'
                    ? 'border-emerald-800 bg-emerald-950/50 text-emerald-300'
                    : 'border-rose-800 bg-rose-950/50 text-rose-300'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                  Senha Atual
                </label>
                <div className="relative">
                  <Key className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="currentPassword"
                    data-testid="currentPassword"
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <Key className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="newPassword"
                    data-testid="newPassword"
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                data-testid="btnSubmit"
                type="submit"
                disabled={isChangingPassword}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
              >
                {isChangingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-500" />
              <h2 className="text-xl font-semibold text-rose-100">Zona de Perigo</h2>
            </div>

            <p className="mb-6 text-sm text-slate-400">
              A exclusão da sua conta é permanente e removerá todos os seus dados do sistema. Esta
              ação não pode ser desfeita.
            </p>

            {deleteMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-300">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>{deleteMessage.text}</span>
              </div>
            )}

            {!showDeleteConfirm ? (
              <button
                data-testid="btnDelete"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 font-semibold text-rose-500 transition hover:bg-rose-500/20"
              >
                <Trash2 className="h-5 w-5" />
                Excluir Minha Conta
              </button>
            ) : (
              <div className="rounded-xl border border-rose-800 bg-rose-900/40 p-6">
                <p className="mb-4 font-medium text-rose-200">
                  Tem certeza absoluta de que deseja excluir sua conta?
                </p>
                <div className="flex gap-3">
                  <button
                    data-testid="btnDeleteConfirm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl bg-rose-600 py-2.5 font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                  >
                    {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                  </button>
                  <button
                    data-testid="btnDeleteCancel"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl bg-slate-800 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
