// Browser-side client for the admin API.
//
// Requests go to same-origin `/api/admin/*` (proxied to the backend by next.config rewrites), so the
// HttpOnly session cookie is attached by the browser and never readable from JavaScript. Every
// state-changing request also carries the CSRF token that /me and /login hand back.

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

const UNAUTHORIZED_EVENT = "admin:unauthorized";

export function onUnauthorized(handler: () => void): () => void {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail
        .slice(0, 3)
        .map((issue: { loc?: unknown[]; msg?: string }) => {
          const field = (issue.loc ?? []).filter((p) => p !== "body").join(" › ");
          const msg = (issue.msg ?? "Invalid value").replace(/^Value error, /, "");
          return field ? `${field}: ${msg}` : msg;
        })
        .join("\n");
    }
  } catch {
    // fall through
  }
  if (res.status === 429) return "Too many attempts. Please wait a few minutes and try again.";
  if (res.status === 413) return "That file is too large.";
  return "Something went wrong. Please try again.";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  /** Skip the "session expired" redirect (used by login itself). */
  quiet401?: boolean;
};

export async function adminApi<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? (opts.body !== undefined || opts.form ? "POST" : "GET");
  const headers: Record<string, string> = {};
  if (method !== "GET" && csrfToken) headers["X-CSRF-Token"] = csrfToken;
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, {
      method,
      headers,
      body,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 401 && !opts.quiet401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) throw new AdminApiError(await readError(res), res.status);
  if (method !== "GET" && changesPublicContent(path)) await refreshPublicSite();
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Account, session and inquiry changes never alter what visitors see.
const PRIVATE_PREFIXES = ["/login", "/logout", "/me", "/forgot-password", "/reset-password", "/change-password", "/inquiries", "/subscribers", "/bookings"];

function changesPublicContent(path: string): boolean {
  return !PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`));
}

/** Clears the public site's cached pages so a saved change shows up straight away. Best effort:
 * if it fails, the public site still catches up when its short cache expires. */
async function refreshPublicSite(): Promise<void> {
  try {
    await fetch("/admin/revalidate", {
      method: "POST",
      credentials: "same-origin",
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // ignore
  }
}

export function errorText(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}
