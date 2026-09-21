import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class InquiryStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CLOSED = "closed"


INQUIRY_TYPES = ("general", "package", "visa", "other")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    source_page: Mapped[str] = mapped_column(String(120), nullable=False)
    inquiry_type: Mapped[str] = mapped_column(String(20), default="general", nullable=False, index=True)
    destination: Mapped[str | None] = mapped_column(String(150), nullable=True)
    package_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tour_packages.id", ondelete="SET NULL"), nullable=True
    )
    travel_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    travel_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    travelers: Mapped[int | None] = mapped_column(nullable=True)
    status: Mapped[InquiryStatus] = mapped_column(
        Enum(InquiryStatus, values_callable=lambda e: [m.value for m in e], name="inquiry_status"),
        default=InquiryStatus.NEW,
        nullable=False,
        index=True,
    )
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), index=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )
