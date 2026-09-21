export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      const field = body.detail[0].loc?.slice(-1)[0];
      return field ? `${field}: ${body.detail[0].msg}` : body.detail[0].msg;
    }
  } catch {
    // fall through to the generic message
  }
  return res.status === 429
    ? "Too many requests. Please try again in a few minutes."
    : "Something went wrong. Please try again.";
}

// Server-side read used by public pages. Cached and revalidated so dashboard edits appear within a minute.
export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
  if (!res.ok) throw new ApiError(`GET ${path} failed`, res.status);
  return res.json() as Promise<T>;
}

// Browser-side JSON request used by forms and the admin dashboard.
export async function apiRequest<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      headers: {
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }
  if (!res.ok) throw new ApiError(await errorMessage(res), res.status);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
