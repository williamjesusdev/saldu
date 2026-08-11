'use client';

import { AccountResponse } from '@/types/api';
import { AccountForm, AccountFormData } from './AccountForm';

export { accountFormSchema as editAccountSchema } from './AccountForm';

export type EditAccountFormData = AccountFormData;

interface Props {
  initialData: AccountResponse;
  onSubmit: (data: EditAccountFormData) => void;
  isLoading?: boolean;
}

export function EditAccountForm({ initialData, onSubmit, isLoading = false }: Readonly<Props>) {
  return (
    <AccountForm
      title="Editar Conta"
      subtitle="Atualize os detalhes da conta bancária."
      submitButtonText="Salvar Alterações"
      loadingButtonText="Salvando..."
      initialData={{
        name: initialData.name,
        institution: initialData.institution as 'BB' | 'ITAU' | 'NUBANK' | 'OTHER',
        type: initialData.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT',
        initialBalance: initialData.initialBalance,
        creditLimit: initialData.creditLimit,
        ignoreInTotals: initialData.ignoreInTotals,
        investmentAccount: initialData.investmentAccount,
      }}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
}
