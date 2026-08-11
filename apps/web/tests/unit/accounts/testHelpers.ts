import { AccountResponse } from '@/types/api';

/**
 * Creates a mocked Response object with JSON body.
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Creates a controllable Promise for testing pending/loading states.
 */
export function createDeferredPromise<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Factory to generate mock account data.
 */
export function createMockAccount(overrides?: Partial<AccountResponse>): AccountResponse {
  return {
    id: 'mocked-uuid',
    name: 'Minha Conta Corrente',
    institution: 'NUBANK',
    type: 'CHECKING',
    initialBalance: 100,
    creditLimit: 0,
    ignoreInTotals: false,
    investmentAccount: false,
    ...overrides,
  };
}
