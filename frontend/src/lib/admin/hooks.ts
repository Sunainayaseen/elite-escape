"use client";

import { useCallback, useEffect, useState } from "react";

import { adminApi, errorText } from "@/lib/admin/client";

type QueryState<T> = { path: string | null; data: T | null; error: string | null };

/** Loads `path` from the admin API. Changing the path (filters, page) shows the loading state again;
 * `reload()` refreshes quietly in the background so tables do not flash after an edit. */
export function useAdminQuery<T>(path: string | null) {
  const [state, setState] = useState<QueryState<T>>({ path: null, data: null, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    adminApi<T>(path)
      .then((data) => {
        if (!cancelled) setState({ path, data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ path, data: s.path === path ? s.data : null, error: errorText(err) }));
      });
    return () => {
      cancelled = true;
    };
  }, [path, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const current = state.path === path;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: path !== null && !(current && (state.data !== null || state.error !== null)),
    reload,
  };
}
