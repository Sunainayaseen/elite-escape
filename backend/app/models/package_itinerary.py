import uuid

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PackageItineraryDay(Base):
    __tablename__ = "package_itinerary_days"
    __table_args__ = (UniqueConstraint("package_id", "day_number", name="uq_itinerary_package_day"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    package_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tour_packages.id", ondelete="CASCADE"), index=True, nullable=False
    )
    day_number: Mapped[int] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    package: Mapped["TourPackage"] = relationship(back_populates="days")
