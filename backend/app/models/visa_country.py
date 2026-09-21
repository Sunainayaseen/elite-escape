import uuid

from sqlalchemy import JSON, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.mixins import SeoMixin


class VisaCountry(SeoMixin, Base):
    __tablename__ = "visa_countries"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    country_name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    flag_emoji: Mapped[str | None] = mapped_column(String(10), nullable=True)
    flag_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    group: Mapped[str] = mapped_column(String(60), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Headline visa type shown in lists; kept in step with the first entry of visa_types.
    visa_type: Mapped[str] = mapped_column(String(120), nullable=False)
    visa_types: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Only filled in when the agency has verified them; null means "not published".
    fee: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    processing_time: Mapped[str | None] = mapped_column(String(80), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
