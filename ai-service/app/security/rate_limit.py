import time
import threading
from typing import Dict, List, Tuple
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint


class SlidingWindowRateLimiter:
    """
    Thread-safe sliding-window in-memory rate limiter.
    Limits:
    - 100 requests/minute for standard users / IP
    - 1000 requests/minute for API keys (X-API-Key or X-Service-Key)
    """
    def __init__(self, window_seconds: int = 60):
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        # client_key -> list of request timestamps
        self._requests: Dict[str, List[float]] = {}

    def is_allowed(self, client_key: str, is_api_key: bool = False) -> Tuple[bool, int, int, int]:
        """
        Determines whether the request is allowed.
        Returns:
            (allowed: bool, limit: int, remaining: int, reset_epoch_sec: int)
        """
        limit = 1000 if is_api_key else 100
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            history = self._requests.setdefault(client_key, [])
            # Prune timestamps outside current sliding window
            history[:] = [ts for ts in history if ts > window_start]

            current_count = len(history)
            reset_epoch_sec = int(now + self.window_seconds)

            if current_count >= limit:
                oldest_ts = history[0] if history else now
                retry_after = max(1, int(oldest_ts + self.window_seconds - now))
                return False, limit, 0, int(now + retry_after)

            history.append(now)
            remaining = limit - len(history)
            return True, limit, remaining, reset_epoch_sec

    def reset(self):
        """Clears rate limit state (primarily for unit tests)."""
        with self._lock:
            self._requests.clear()


rate_limiter = SlidingWindowRateLimiter(window_seconds=60)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware that enforces 100 req/min (Standard User) and 1000 req/min (API Key),
    injecting X-RateLimit-* headers on all responses.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Exclude internal health and docs endpoints from strict throttling
        path = request.url.path
        if path in ["/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"]:
            return await call_next(request)

        # Detect client key (API Key, Bearer Token, or Client IP)
        api_key = request.headers.get("X-API-Key") or request.headers.get("X-Service-Key")
        auth_header = request.headers.get("Authorization", "")
        
        is_api_key = bool(api_key and len(api_key) > 5)

        if is_api_key:
            client_key = f"api_key:{api_key}"
        elif auth_header.startswith("Bearer "):
            # Key on token signature / hash
            client_key = f"user_token:{auth_header[-20:]}"
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"
            client_key = f"ip:{client_ip}"

        allowed, limit, remaining, reset_time = rate_limiter.is_allowed(client_key, is_api_key)

        req_id = getattr(request.state, "request_id", "req-unknown")

        if not allowed:
            retry_after = max(1, reset_time - int(time.time()))
            headers = {
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
                "Retry-After": str(retry_after)
            }
            return JSONResponse(
                status_code=429,
                headers=headers,
                content={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Rate limit exceeded. Maximum {limit} requests per minute allowed.",
                        "request_id": req_id,
                        "retry_after_seconds": retry_after
                    }
                }
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        return response
