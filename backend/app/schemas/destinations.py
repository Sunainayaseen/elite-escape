import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrl, LongText, OptText, SeoFields, SeoOut, Text1


class DestinationIn(SeoFields):
    name: Text1 = Field(min_length=1, max_length=120)
    slug: OptText = Field(default=None, max_length=140)
    tagline: OptText = Field(default=None, max_length=200)
    description: LongText = Field(default=None, max_length=5000)
    image: ImageUrl = None
    is_published: bool = False
    sort_order: int = Field(default=0, ge=0, le=100_000)
    # None leaves the assignment untouched; a list replaces it (an empty list unassigns everything).
    package_ids: list[uuid.UUID] | None = None


class DestinationOut(SeoOut):
    id: uuid.UUID
    name: str
    slug: str
    tagline: str | None
    description: str | None
    image: str | None
    is_published: bool
    sort_order: int
    package_ids: list[uuid.UUID] = []
    package_count: int = 0
    created_at: datetime
    updated_at: datetime


class DestinationPublic(SeoOut):
    id: uuid.UUID
    name: str
    slug: str
    tagline: str | None
    description: str | None
    image: str | None
    package_count: int = 0
