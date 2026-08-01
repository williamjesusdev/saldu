import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockPush.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error if useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
    consoleSpy.mockRestore();
  });

  it('initializes as unauthenticated without fetching if localStorage hint is missing', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('fetches user profile if localStorage hint is present and sets authenticated', async () => {
    localStorage.setItem('isAuthenticated', 'true');
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ role: 'PLATFORM_ADMIN', id: '1' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.role).toBe('PLATFORM_ADMIN');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/v1/users/me', expect.any(Object));
  });

  it('handles successful login flow', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Success' }), {
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ role: 'USER', hasConsented: true }), {
          headers: { 'content-type': 'application/json' },
        }),
      );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      const user = await result.current.login('test@saldu.com', 'Secret123!');
      expect(user.hasConsented).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('isAuthenticated')).toBe('true');
  });

  it('handles expired token or fetch failure and clears localStorage hint', async () => {
    localStorage.setItem('isAuthenticated', 'true');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });

  it('handles network error during checkAuth gracefully', async () => {
    localStorage.setItem('isAuthenticated', 'true');
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles logout flow correctly', async () => {
    localStorage.setItem('isAuthenticated', 'true');
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ role: 'USER' }), {
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('handles logout network error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('isAuthenticated', 'true');
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ role: 'USER' }), {
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockRejectedValueOnce(new Error('Logout network error'));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/login');

    consoleSpy.mockRestore();
  });
});
