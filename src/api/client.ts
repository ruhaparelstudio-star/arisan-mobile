const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = [500, 1000];

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type AuthEventListener = () => void;
let sessionExpiredListener: AuthEventListener | null = null;

export function setSessionExpiredListener(fn: AuthEventListener | null) {
  sessionExpiredListener = fn;
}

async function attemptFetch(
  path: string,
  options: RequestInit & { token?: string },
): Promise<Response> {
  const { token, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${path}`, {
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
}

export async function apiCall<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const opts = options ?? {};
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS[attempt - 1]));
    }

    let res: Response;
    try {
      res = await attemptFetch(path, opts);
    } catch (e) {
      lastError = e as ApiError;
      // Retry hanya untuk network error (status 0), bukan 4xx/5xx
      continue;
    }

    if (!res.ok) {
      if ((res.status === 401 || res.status === 403) && sessionExpiredListener) {
        sessionExpiredListener();
      }
      const err = await res.json().catch(() => ({ error: 'Terjadi kesalahan. Coba lagi.' }));
      const msg = typeof err.error === 'string' ? err.error : 'Request gagal';
      const apiErr = new ApiError(res.status, msg);

      // Retry hanya untuk 5xx (server error), bukan 4xx (client error)
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        lastError = apiErr;
        continue;
      }
      throw apiErr;
    }

    return res.json();
  }

  throw lastError ?? new ApiError(0, 'Tidak dapat terhubung ke server. Periksa jaringan kamu.');
}
