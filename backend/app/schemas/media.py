import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import OptText


class MediaOut(BaseModel):
    id: uuid.UUID
    url: str
    thumb_url: str
    variants: dict[str, str]
    original_name: str
    mime_type: str
    size_bytes: int
    width: int
    height: int
    alt_text: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MediaUpdate(BaseModel):
    alt_text: OptText = Field(default=None, max_length=300)
