export interface AccountResponse {
  id: string;
  name: string;
  institution: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT';
  initialBalance: number;
  creditLimit: number;
  ignoreInTotals: boolean;
  investmentAccount: boolean;
}
