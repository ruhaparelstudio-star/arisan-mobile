const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...rest } = options ?? {};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers ?? {}),
      },
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError(0, 'Koneksi timeout. Periksa jaringan lalu coba lagi.');
    }
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Periksa jaringan kamu.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Terjadi kesalahan. Coba lagi.' }));
    throw new ApiError(res.status, err.error ?? 'Request gagal');
  }
  return res.json();
}
