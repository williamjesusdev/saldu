'use client';

import { AlertCircle, KeyRound, Lock, Mail, User } from 'lucide-react';
import { ChangeEvent, SubmitEvent, useState } from 'react';
import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'E-mail é obrigatório').pipe(z.email('E-mail inválido')),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().trim().min(1, 'E-mail é obrigatório').pipe(z.email('E-mail inválido')),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos 1 letra maiúscula')
    .regex(/\d/, 'Senha deve conter ao menos 1 número'),
  token: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
type AuthFormData = Partial<LoginFormData & RegisterFormData>;

interface LoginModeProps {
  mode: 'login';
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
}

interface RegisterModeProps {
  mode: 'register';
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
  initialToken?: string;
  showTokenField?: boolean;
  onToggleToken?: () => void;
}

export function AuthForm(props: Readonly<LoginModeProps | RegisterModeProps>) {
  const { mode, isLoading = false } = props;

  const initialToken = (mode === 'register' ? props.initialToken : '') || '';
  const showTokenField = mode === 'register' && props.showTokenField;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    token: initialToken,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setErrors({});

    const result =
      mode === 'register'
        ? registerFormSchema.safeParse(formData)
        : loginFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0]);
        fieldErrors[path] = fieldErrors[path] ?? issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (mode === 'register') {
      props.onSubmit(result.data as RegisterFormData);
      return;
    }

    props.onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name field — register only */}
      {mode === 'register' && (
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
              name="name"
              data-testid="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Maria Silva"
              className={`w-full rounded-xl border bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:outline-none ${
                errors.name
                  ? 'border-rose-500/50 focus:border-rose-500'
                  : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>
      )}

      {/* Email field */}
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

      {/* Password field */}
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
            name="password"
            data-testid="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={
              mode === 'register' ? 'Mínimo 8 caracteres (1 maiúscula, 1 número)' : '••••••••'
            }
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

      {/* Token toggle + field — register only */}
      {mode === 'register' && (
        <>
          <div className="pt-2">
            <button
              data-testid="btnUseToken"
              type="button"
              onClick={(props as RegisterModeProps).onToggleToken}
              className="text-xs font-medium text-emerald-400 underline hover:text-emerald-300"
            >
              {showTokenField ? 'Não possui código de convite?' : 'Possui um código de convite?'}
            </button>
          </div>

          {showTokenField && (
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
                  name="token"
                  data-testid="token"
                  type="text"
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="Cole seu código de convite"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-10 text-slate-100 placeholder-slate-600 transition focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Submit */}
      <button
        data-testid="btnSubmit"
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
      >
        {isLoading && (mode === 'login' ? 'Entrando...' : 'Processando...')}
        {!isLoading && (mode === 'login' ? 'Entrar na Conta' : 'Solicitar Acesso')}
      </button>
    </form>
  );
}
