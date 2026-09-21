import re
import unicodedata

from sqlalchemy.orm import Session


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "item"


def unique_slug(db: Session, model, base: str, exclude_id=None) -> str:
    slug = slugify(base)
    candidate = slug
    counter = 2
    while True:
        query = db.query(model).filter(model.slug == candidate)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        if query.first() is None:
            return candidate
        candidate = f"{slug}-{counter}"
        counter += 1
