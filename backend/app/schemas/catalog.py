import re
import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, Field, TypeAdapter, field_validator, model_validator

from app.schemas.common import ImageUrl, LongText, OptText, SeoFields, SeoOut, Text1, TextList

# Re-exported so existing imports keep working; the visa schemas now live in schemas/visa.py.
from app.schemas.visa import VisaCountryIn, VisaCountryOut  # noqa: F401

PackageStatus = Literal["draft", "published", "unpublished"]

ImageUrlAdapter: TypeAdapter = TypeAdapter(ImageUrl)


class ItineraryDay(BaseModel):
    day: int = Field(ge=1, le=365)
    title: Text1 = Field(min_length=1, max_length=200)
    description: Text1 = Field(default="", max_length=2000)


class OptionalExperience(BaseModel):
    title: Text1 = Field(min_length=1, max_length=150)
    description: OptText = Field(default=None, max_length=600)


class FaqItem(BaseModel):
    question: Text1 = Field(min_length=1, max_length=250)
    answer: Text1 = Field(min_length=1, max_length=2000)


class CategoryIn(BaseModel):
    name: Text1 = Field(min_length=1, max_length=120)
    slug: OptText = Field(default=None, max_length=140)
    section: Text1 = Field(default="holidays", max_length=60)
    icon: OptText = Field(default=None, max_length=60)
    description: LongText = None
    image: ImageUrl = None
    sort_order: int = 0


class CategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    section: str
    icon: str | None
    description: str | None
    image: str | None
    sort_order: int

    model_config = {"from_attributes": True}


def _currency(value: str) -> str:
    value = value.strip().upper()
    if not re.fullmatch(r"[A-Z]{3}", value):
        raise ValueError("Use a 3-letter currency code such as AED or USD")
    return value


class PackageIn(SeoFields):
    title: Text1 = Field(min_length=1, max_length=200)
    slug: OptText = Field(default=None, max_length=220)
    category_id: uuid.UUID
    destination_id: uuid.UUID | None = None
    # Free-text place name; only needed when no destination is chosen.
    country: OptText = Field(default=None, max_length=120)
    summary: Text1 = Field(min_length=1, max_length=1000)
    description: LongText = Field(default=None, max_length=20_000)
    price_from: float = Field(gt=0, le=10_000_000)
    price_to: float = Field(gt=0, le=10_000_000)
    currency: Annotated[str, AfterValidator(_currency)] = "AED"
    duration: Text1 = Field(min_length=1, max_length=60)
    tour_types: TextList = Field(default_factory=list, max_length=10)
    group_size: OptText = Field(default=None, max_length=60)
    main_image: ImageUrl
    images: Annotated[list[str], Field(max_length=30)] = []
    highlights: TextList = Field(default_factory=list, max_length=30)
    itinerary: list[ItineraryDay] = Field(default_factory=list, max_length=60)
    inclusions: TextList = Field(default_factory=list, max_length=50)
    exclusions: TextList = Field(default_factory=list, max_length=50)
    accommodation: LongText = Field(default=None, max_length=5000)
    transportation: LongText = Field(default=None, max_length=5000)
    optional_experiences: list[OptionalExperience] = Field(default_factory=list, max_length=30)
    important_notes: LongText = Field(default=None, max_length=5000)
    faq: list[FaqItem] = Field(default_factory=list, max_length=30)
    status: PackageStatus = "draft"
    is_featured: bool = False
    position: int = Field(default=0, ge=0, le=100_000)

    @field_validator("main_image")
    @classmethod
    def _main_image_required(cls, value: str | None) -> str:
        if not value:
            raise ValueError("A main image is required")
        return value

    @field_validator("images")
    @classmethod
    def _gallery_urls(cls, values: list[str]) -> list[str]:
        cleaned = []
        for value in values:
            url = ImageUrlAdapter.validate_python(value)
            if url and url not in cleaned:
                cleaned.append(url)
        return cleaned

    @model_validator(mode="after")
    def _consistency(self):
        if self.price_to < self.price_from:
            raise ValueError("price_to must be greater than or equal to price_from")
        if self.destination_id is None and not self.country:
            raise ValueError("Choose a destination or enter the country")
        days = [d.day for d in self.itinerary]
        if len(days) != len(set(days)):
            raise ValueError("Itinerary day numbers must be unique")
        return self


class PackageOut(SeoOut):
    id: uuid.UUID
    slug: str
    title: str
    category: str
    category_id: uuid.UUID
    category_name: str
    country: str
    summary: str
    description: str | None
    price_from: float
    price_to: float
    currency: str
    duration: str
    tour_types: list[str]
    group_size: str | None
    image: str
    gallery: list[str]
    highlights: list[str]
    itinerary: list[ItineraryDay]
    inclusions: list[str]
    exclusions: list[str]
    accommodation: str | None = None
    transportation: str | None = None
    optional_experiences: list[OptionalExperience] = []
    important_notes: str | None = None
    faq: list[FaqItem] = []
    is_featured: bool
    is_active: bool


class PackageAdminOut(PackageOut):
    """What the dashboard edits: everything public, plus status, ordering and the split image fields."""

    status: PackageStatus
    position: int
    destination_id: uuid.UUID | None
    main_image: str | None
    images: list[str]  # gallery only (the public `gallery` also includes the main image)
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime
