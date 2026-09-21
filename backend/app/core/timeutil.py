from datetime import datetime, timezone


def utcnow() -> datetime:
    """Naive UTC timestamp, matching the naive DateTime columns used across the schema."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
