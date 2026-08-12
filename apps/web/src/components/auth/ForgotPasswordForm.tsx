'use client';

import { AlertCircle, Lock, Mail } from 'lucide-react';
import { ChangeEvent, SubmitEvent, useState } from 'react';
import { z } from 'zod';

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().min(1, 'E-mail é obrigatório').pipe(z.email('E-mail inválido')),
});

export const forgotPasswordResetSchema = z.object({
  email: z.string().trim().min(1, 'E-mail é obrigatório').pipe(z.email('E-mail inválido')),
  token: z.string().min(1, 'Token de recuperação é obrigatório'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos 1 letra maiúscula')
    .regex(/\d/, 'Senha deve conter ao menos 1 número'),
});

type ForgotPasswordRequestData = z.infer<typeof forgotPasswordRequestSchema>;
type ForgotPasswordResetData = z.infer<typeof forgotPasswordResetSchema>;
export type ForgotPasswordFormData = Partial<ForgotPasswordRequestData & ForgotPasswordResetData>;

interface RequestModeProps {
  mode: 'request';
  onSubmit: (data: ForgotPasswordFormData) => void;
  isLoading: boolean;
  initialEmail?: string;
}

interface ResetModeProps {
  mode: 'reset';
  onSubmit: (data: ForgotPasswordFormData) => void;
  isLoading: boolean;
  initialEmail?: string;
  initialToken?: string;
}

export function ForgotPasswordForm(props: Readonly<RequestModeProps | ResetModeProps>) {
  const { mode, isLoading = false } = props;

  const initialToken = (mode === 'reset' ? props.initialToken : '') || '';

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: props.initialEmail,
    token: initialToken,
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setErrors({});

    const result =
      mode === 'reset'
        ? forgotPasswordResetSchema.safeParse(formData)
        : forgotPasswordRequestSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0]);
        fieldErrors[path] = fieldErrors[path] ?? issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
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
            name="email"
            data-testid="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            className={`w-full rounded-xl border bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:outline-none ${
              errors.email
                ? 'border-rose-500/50 focus:border-rose-500'
                : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Token + Password — reset mode only */}
      {mode === 'reset' && (
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
              name="token"
              data-testid="token"
              type="text"
              value={formData.token}
              onChange={handleChange}
              placeholder="Token de verificação"
              className={`w-full rounded-xl border bg-slate-950/60 px-4 py-2.5 text-slate-100 placeholder-slate-600 transition focus:outline-none ${
                errors.token
                  ? 'border-rose-500/50 focus:border-rose-500'
                  : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
            {errors.token && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="h-3 w-3" />
                {errors.token}
              </p>
            )}
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
                name="password"
                data-testid="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres (1 maiúscula, 1 número)"
                className={`w-full rounded-xl border bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:outline-none ${
                  errors.password
                    ? 'border-rose-500/50 focus:border-rose-500'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>
        </>
      )}

      {/* Submit */}
      <button
        data-testid="btnSubmit"
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
      >
        {isLoading && 'Enviando...'}
        {!isLoading && (mode === 'reset' ? 'Redefinir Senha' : 'Enviar E-mail de Recuperação')}
      </button>
    </form>
  );
}
