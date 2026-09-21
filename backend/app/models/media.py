import uuid
from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class Media(Base):
    __tablename__ = "media"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    # Path of the optimised full-size WebP, e.g. /uploads/2026/09/ab12cd34ef56-japan-large.webp
    url: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    thumb_url: Mapped[str] = mapped_column(String(500), nullable=False)
    # Extra generated renditions, e.g. {"medium": "/uploads/...", "avif": "/uploads/..."}
    variants: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(60), nullable=False)
    size_bytes: Mapped[int] = mapped_column(nullable=False)
    width: Mapped[int] = mapped_column(nullable=False)
    height: Mapped[int] = mapped_column(nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(300), nullable=True)
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), index=True, nullable=False)
