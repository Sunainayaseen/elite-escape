import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.core.http import client_ip


class RateLimiter:
    """In-memory sliding-window limiter, per client IP. Fine for a single-process deployment;
    with several workers each keeps its own window, which only makes the limit more lenient."""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def __call__(self, request: Request) -> None:
        # client_ip() only trusts X-Forwarded-For when the API sits behind our own proxy. Trusting it
        # unconditionally would let anyone who can reach the API directly rotate the header and dodge the limit.
        client = client_ip(request)
        now = time.monotonic()
        hits = self._hits[client]
        while hits and now - hits[0] > self.window_seconds:
            hits.popleft()
        if len(hits) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again in a few minutes.",
            )
        hits.append(now)
        if len(self._hits) > 5000:
            for key in [k for k, v in self._hits.items() if not v]:
                del self._hits[key]
