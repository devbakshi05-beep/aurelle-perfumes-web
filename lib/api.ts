export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5215";

export class ApiError extends Error {
  status: number;
  code?: string; // backend ka error code, jaise "EMAIL_NOT_VERIFIED"
  data: Record<string, unknown>; // backend ne jo poora error body bheja

  constructor(message: string, status: number, data: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.data = data;
    this.code = typeof data.code === "string" ? data.code : undefined;
  }
}

type Options = Omit<RequestInit, "headers"> & {
  token?: string | null;
  headers?: Record<string, string>;
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  // Server (Netlify) par call ho rahi ho toh 8 second baad haar maan lo. Free backend so raha ho toh
  // page latakne ki jagah friendly message dikhega. Browser ki calls par koi timeout nahi.
  const serverSignal = typeof window === "undefined" ? { signal: AbortSignal.timeout(8000) } : {};

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...serverSignal,
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText || "Something went wrong";
    let data: Record<string, unknown> = {};
    try {
      const b = await res.json();
      data = b ?? {};
      const firstError = b.errors ? (Object.values(b.errors)[0] as string[])[0] : undefined;
      message = b.message ?? firstError ?? b.title ?? message;
    } catch {}
    throw new ApiError(message, res.status, data);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}
