import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrl, LongText, OptText, SeoFields, SeoOut, Text1


class BlogCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str

    model_config = {"from_attributes": True}


class BlogPostIn(SeoFields):
    title: Text1 = Field(min_length=1, max_length=220)
    slug: OptText = Field(default=None, max_length=240)
    excerpt: OptText = Field(default=None, max_length=400)
    content: Text1 = Field(min_length=1, max_length=100_000)
    cover_image: ImageUrl = None
    category_id: uuid.UUID | None = None
    is_published: bool = False


class BlogPostOut(SeoOut):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str | None
    content: str
    cover_image: str | None
    category: BlogCategoryOut | None = None
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    values: dict[str, str]


class BlogCategoryIn(BaseModel):
    name: Text1 = Field(min_length=1, max_length=120)
    description: LongText = Field(default=None, max_length=1000)
