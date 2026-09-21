import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

// Called by the dashboard right after it saves a change, so the public website shows the new content
// immediately instead of waiting for its cache to expire. It only clears cached pages, changes no
// data, and refuses anyone who does not hold a valid admin session.
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return new Response(null, { status: 403 });
  }

  let valid = false;
  try {
    const res = await fetch(`${API_ORIGIN}/api/admin/me`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    valid = res.ok;
  } catch {
    valid = false;
  }
  if (!valid) return new Response(null, { status: 401 });

  revalidatePath("/", "layout");
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
