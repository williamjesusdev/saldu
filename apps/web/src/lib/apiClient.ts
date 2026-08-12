import { ApiError } from '@/types/api';

export class ApiException extends Error {
  public status: number;
  public data: ApiError;

  constructor(message: string, status: number, data: ApiError) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.data = data;
  }
}

export function getSuccessMessage(
  data: { message?: string } | undefined | null,
  defaultMessage = 'Operação realizada com sucesso.',
): string {
  return data?.message || defaultMessage;
}

export function getErrorMessage(
  err: unknown,
  defaultMessage = 'Ocorreu um erro inesperado.',
): string {
  return err instanceof Error && err.message ? err.message : defaultMessage;
}

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }
  const match = new RegExp(/(?:^|; )XSRF-TOKEN=([^;]*)/).exec(document.cookie);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && !headers['X-XSRF-TOKEN']) {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return {} as T;
  }

  const contentType =
    typeof res.headers?.get === 'function' ? res.headers.get('content-type') : null;

  const text = await res.text();
  const isJson = contentType?.includes('application/json');

  /* v8 ignore next -- @preserve */
  const data = isJson ? JSON.parse(text || '{}') : text;

  if (!res.ok) {
    const apiError = data || ({} as ApiError);
    let errorMessage = 'Erro de conexão ou serviço indisponível.';

    if (apiError?.errors && Object.keys(apiError.errors).length > 0) {
      errorMessage = Object.values(apiError.errors).join('; ');
    } else if (apiError?.detail || apiError?.title) {
      errorMessage = apiError.detail || apiError.title;
    } else if (typeof data === 'string' && data) {
      errorMessage = data;
    }

    throw new ApiException(errorMessage, res.status, apiError);
  }

  return data as T;
}
