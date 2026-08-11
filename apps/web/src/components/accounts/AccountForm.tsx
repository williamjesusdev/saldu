'use client';

import { AlertCircle, Landmark } from 'lucide-react';
import { ChangeEvent, SubmitEvent, useState } from 'react';
import { z } from 'zod';

export const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  institution: z.enum(['BB', 'ITAU', 'NUBANK', 'OTHER']),
  type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT']),
  initialBalance: z.coerce.number().default(0),
  creditLimit: z.coerce.number().default(0),
  ignoreInTotals: z.boolean().default(false),
  investmentAccount: z.boolean().default(false),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  title: string;
  subtitle: string;
  submitButtonText: string;
  loadingButtonText: string;
  initialData?: Partial<AccountFormData>;
  onSubmit: (data: AccountFormData) => void;
  isLoading?: boolean;
}

export function AccountForm({
  title,
  subtitle,
  submitButtonText,
  loadingButtonText,
  initialData,
  onSubmit,
  isLoading = false,
}: Readonly<AccountFormProps>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<AccountFormData>>({
    name: initialData?.name ?? '',
    institution: initialData?.institution ?? 'OTHER',
    type: initialData?.type ?? 'CHECKING',
    initialBalance: initialData?.initialBalance ?? 0,
    creditLimit: initialData?.creditLimit ?? 0,
    ignoreInTotals: initialData?.ignoreInTotals ?? false,
    investmentAccount: initialData?.investmentAccount ?? false,
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setErrors({});
    const result = accountFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0]);
        fieldErrors[path] = fieldErrors[path] ?? issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md"
    >
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 shadow-inner">
            <Landmark className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
          >
            Nome da Conta
          </label>
          <div className="relative mt-2">
            <input
              id="name"
              name="name"
              type="text"
              data-testid="name"
              onChange={handleChange}
              value={formData.name || ''}
              className={`block w-full rounded-xl border bg-slate-950/60 px-4 py-2.5 text-slate-100 placeholder-slate-600 transition focus:outline-none sm:text-sm ${
                errors.name
                  ? 'border-rose-500/50 focus:border-rose-500'
                  : 'border-slate-800 focus:border-emerald-500'
              }`}
              placeholder="ex: Nubank Principal"
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="institution"
            className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
          >
            Instituição
          </label>
          <div className="mt-2">
            <select
              id="institution"
              name="institution"
              data-testid="institution"
              onChange={handleChange}
              value={formData.institution}
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-slate-100 transition focus:border-emerald-500 focus:outline-none sm:text-sm"
            >
              <option value="BB">Banco do Brasil</option>
              <option value="ITAU">Itaú</option>
              <option value="NUBANK">Nubank</option>
              <option value="OTHER">Outras</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
          >
            Tipo de Conta
          </label>
          <div className="mt-2">
            <select
              id="type"
              name="type"
              data-testid="type"
              onChange={handleChange}
              value={formData.type}
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-slate-100 transition focus:border-emerald-500 focus:outline-none sm:text-sm"
            >
              <option value="CHECKING">Conta Corrente</option>
              <option value="SAVINGS">Conta Poupança</option>
              <option value="INVESTMENT">Conta de Investimento</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="initialBalance"
            className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
          >
            Saldo Inicial
          </label>
          <div className="relative mt-2 rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-slate-500 sm:text-sm">R$</span>
            </div>
            <input
              id="initialBalance"
              name="initialBalance"
              type="number"
              data-testid="initialBalance"
              step="0.01"
              onChange={handleChange}
              value={formData.initialBalance}
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-11 text-slate-100 transition focus:border-emerald-500 focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="creditLimit"
            className="block text-xs font-semibold tracking-wider text-slate-300 uppercase"
          >
            Limite Extra
          </label>
          <div className="relative mt-2 rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-slate-500 sm:text-sm">R$</span>
            </div>
            <input
              id="creditLimit"
              name="creditLimit"
              type="number"
              data-testid="creditLimit"
              step="0.01"
              onChange={handleChange}
              value={formData.creditLimit}
              className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pr-4 pl-11 text-slate-100 transition focus:border-emerald-500 focus:outline-none sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-800/50 pt-6">
        <fieldset>
          <legend className="sr-only">Opções adicionais</legend>
          <div className="space-y-5">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="ignoreInTotals"
                  name="ignoreInTotals"
                  type="checkbox"
                  data-testid="ignoreInTotals"
                  onChange={handleChange}
                  checked={formData.ignoreInTotals || false}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
              </div>
              <div className="ml-3 text-sm/6">
                <label htmlFor="ignoreInTotals" className="font-medium text-slate-200">
                  Ignorar nos Totais
                </label>
                <p className="text-slate-400">
                  O saldo desta conta não será somado ao patrimônio total.
                </p>
              </div>
            </div>
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="investmentAccount"
                  name="investmentAccount"
                  type="checkbox"
                  data-testid="investmentAccount"
                  onChange={handleChange}
                  checked={formData.investmentAccount || false}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
              </div>
              <div className="ml-3 text-sm/6">
                <label htmlFor="investmentAccount" className="font-medium text-slate-200">
                  Conta de Investimento
                </label>
                <p className="text-slate-400">
                  Marcar explicitamente se for destinada apenas a investimentos.
                </p>
              </div>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex items-center justify-end gap-x-4">
        <button
          type="button"
          data-testid="btnCancel"
          onClick={() => window.history.back()}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          data-testid="btnSubmit"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? loadingButtonText : submitButtonText}
        </button>
      </div>
    </form>
  );
}
