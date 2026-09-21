from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column


class SeoMixin:
    """Editable SEO fields. Left empty they stay empty: nothing is auto-generated, and the public
    pages fall back to their own plain title/description."""

    seo_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(320), nullable=True)
    og_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    og_description: Mapped[str | None] = mapped_column(String(320), nullable=True)
    canonical_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    focus_keyword: Mapped[str | None] = mapped_column(String(120), nullable=True)
