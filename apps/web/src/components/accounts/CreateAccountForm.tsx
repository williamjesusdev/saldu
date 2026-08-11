'use client';

import { AccountForm, AccountFormData } from './AccountForm';

export { accountFormSchema as createAccountSchema } from './AccountForm';

export type CreateAccountFormData = AccountFormData;

interface Props {
  onSubmit: (data: CreateAccountFormData) => void;
  isLoading?: boolean;
}

export function CreateAccountForm({ onSubmit, isLoading = false }: Readonly<Props>) {
  return (
    <AccountForm
      title="Detalhes da Conta"
      subtitle="Insira os detalhes da nova conta ou destino financeiro."
      submitButtonText="Criar Conta"
      loadingButtonText="Criando..."
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
}
