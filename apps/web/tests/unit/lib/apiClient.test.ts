import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiException, fetchApi, getErrorMessage, getSuccessMessage } from '@/lib/apiClient';
import { ApiError } from '@/types/api';

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getErrorMessage', () => {
    it('returns error message if error is an instance of Error', () => {
      const err = new Error('Test error message');
      expect(getErrorMessage(err)).toBe('Test error message');
    });

    it('returns default message if error is not an instance of Error', () => {
      const err = 'Just a string error';
      expect(getErrorMessage(err)).toBe('Ocorreu um erro inesperado.');
    });

    it('returns custom default message if error is not an instance of Error', () => {
      const err = null;
      expect(getErrorMessage(err, 'Custom default')).toBe('Custom default');
    });

    it('returns default message if Error instance has no message', () => {
      const err = new Error('');
      expect(getErrorMessage(err)).toBe('Ocorreu um erro inesperado.');
    });
  });

  describe('getSuccessMessage', () => {
    it('returns message from data when message property is present', () => {
      const data = { message: 'Sucesso customizado' };
      expect(getSuccessMessage(data)).toBe('Sucesso customizado');
    });

    it('returns fallback message when data or message is empty', () => {
      expect(getSuccessMessage({})).toBe('Operação realizada com sucesso.');
      expect(getSuccessMessage(null, 'Fallback customizado')).toBe('Fallback customizado');
    });
  });

  describe('fetchApi', () => {
    it('handles 204 No Content', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        status: 204,
        ok: true,
      } as Response);

      const data = await fetchApi('/api/test');
      expect(data).toEqual({});
    });

    it('handles JSON response correctly', async () => {
      const mockData = { id: 1, name: 'Test' };
      vi.mocked(fetch).mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
        text: () => Promise.resolve(JSON.stringify(mockData)),
      } as unknown as Response);

      const data = await fetchApi('/api/test');
      expect(data).toEqual(mockData);
    });

    it('handles text response correctly', async () => {
      const mockText = 'Internal Server Error';
      vi.mocked(fetch).mockResolvedValueOnce({
        status: 500,
        ok: false,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockText),
      } as unknown as Response);

      await expect(fetchApi('/api/test')).rejects.toThrow(
        new ApiException(
          'Internal Server Error',
          500,
          'Internal Server Error' as unknown as ApiError,
        ),
      );
    });

    it('throws ApiException with detail message on api error', async () => {
      const apiErrorData = { detail: 'API Error Detail' };
      vi.mocked(fetch).mockResolvedValueOnce({
        status: 400,
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(apiErrorData),
        text: () => Promise.resolve(JSON.stringify(apiErrorData)),
      } as unknown as Response);

      await expect(fetchApi('/api/test')).rejects.toThrow(
        new ApiException('API Error Detail', 400, apiErrorData as ApiError),
      );
    });

    it('throws ApiException with title on api error if detail is missing', async () => {
      const apiErrorData = { title: 'API Error Title' };
      vi.mocked(fetch).mockResolvedValueOnce({
        status: 500,
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(apiErrorData),
        text: () => Promise.resolve(JSON.stringify(apiErrorData)),
      } as unknown as Response);

      await expect(fetchApi('/api/test')).rejects.toThrow(
        new ApiException('API Error Title', 500, apiErrorData as ApiError),
      );
    });

    it('throws ApiException combining field validation errors', async () => {
      const apiErrorData = {
        errors: {
          email: 'Invalid email',
          password: 'Too short',
        } as Record<string, string>,
      };
      vi.mocked(fetch).mockResolvedValueOnce({
        status: 422,
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(apiErrorData),
        text: () => Promise.resolve(JSON.stringify(apiErrorData)),
      } as unknown as Response);

      await expect(fetchApi('/api/test')).rejects.toThrow(
        new ApiException('Invalid email; Too short', 422, apiErrorData as ApiError),
      );
    });

    it('throws generic error when response is not ok and body is empty', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(''),
      } as unknown as Response);

      await expect(fetchApi('/api/test')).rejects.toThrow(
        new ApiException('Erro de conexão ou serviço indisponível.', 401, {} as ApiError),
      );
    });
  });
});
