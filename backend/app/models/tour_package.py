import uuid
from datetime import datetime

from sqlalchemy import JSON, ForeignKey, Numeric, String, Text, Uuid, and_
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base
from app.models.mixins import SeoMixin
from app.models.package_itinerary import PackageItineraryDay

PACKAGE_STATUSES = ("draft", "published", "unpublished")


class TourPackage(SeoMixin, Base):
    __tablename__ = "tour_packages"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"), nullable=False)
    destination_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("destinations.id", ondelete="SET NULL"), index=True, nullable=True
    )
    # Display text for the place. When a destination is linked it follows the destination's name.
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # The business publishes a per-person price range, e.g. "AED 2,000 - 2,500".
    price_from: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    price_to: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="AED", nullable=False)
    duration: Mapped[str] = mapped_column(String(60), nullable=False)
    tour_types: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    group_size: Mapped[str | None] = mapped_column(String(60), nullable=True)
    main_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Gallery images shown besides the main image.
    images: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    highlights: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    inclusions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    exclusions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    accommodation: Mapped[str | None] = mapped_column(Text, nullable=True)
    transportation: Mapped[str | None] = mapped_column(Text, nullable=True)
    optional_experiences: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    important_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    faq: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    # draft / published / unpublished. Only "published" and not archived is visible publicly.
    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False, index=True)
    is_featured: Mapped[bool] = mapped_column(default=False, nullable=False)
    position: Mapped[int] = mapped_column(default=0, nullable=False, index=True)
    # Soft delete: an archived package keeps its data but disappears everywhere except the trash view.
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    category: Mapped["Category"] = relationship(back_populates="packages")
    destination: Mapped["Destination | None"] = relationship()
    bookings: Mapped[list["Booking"]] = relationship(back_populates="package")
    days: Mapped[list[PackageItineraryDay]] = relationship(
        back_populates="package",
        cascade="all, delete-orphan",
        order_by=PackageItineraryDay.day_number,
        lazy="selectin",
    )

    @hybrid_property
    def is_active(self) -> bool:
        """Publicly visible. Derived, so it can never disagree with status / deleted_at."""
        return self.status == "published" and self.deleted_at is None

    @is_active.inplace.expression
    @classmethod
    def _is_active_expression(cls):
        return and_(cls.status == "published", cls.deleted_at.is_(None))

    @property
    def itinerary(self) -> list[dict]:
        return [{"day": d.day_number, "title": d.title, "description": d.description} for d in self.days]

    @itinerary.setter
    def itinerary(self, value: list[dict]) -> None:
        # Update rows in place, keyed by day number, so re-saving never trips the unique constraint.
        existing = {d.day_number: d for d in self.days}
        keep: list[PackageItineraryDay] = []
        for item in value:
            row = existing.get(item["day"])
            if row is None:
                row = PackageItineraryDay(day_number=item["day"])
            row.title = item["title"]
            row.description = item.get("description") or ""
            keep.append(row)
        self.days = sorted(keep, key=lambda d: d.day_number)
