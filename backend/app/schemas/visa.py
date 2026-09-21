import uuid

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ImageUrl, LongText, OptText, SeoFields, SeoOut, Text1


class VisaType(BaseModel):
    name: Text1 = Field(min_length=1, max_length=120)
    description: OptText = Field(default=None, max_length=600)


class VisaCountryIn(SeoFields):
    country_name: Text1 = Field(min_length=1, max_length=120)
    slug: OptText = Field(default=None, max_length=140)
    flag_emoji: OptText = Field(default=None, max_length=10)
    flag_image: ImageUrl = None
    group: Text1 = Field(min_length=1, max_length=60)
    description: LongText = Field(default=None, max_length=5000)
    visa_types: list[VisaType] = Field(min_length=1, max_length=20)
    requirements: LongText = Field(default=None, max_length=5000)
    # Leave empty unless the agency has verified them; empty values are not shown publicly.
    fee: float | None = Field(default=None, ge=0, le=1_000_000)
    processing_time: OptText = Field(default=None, max_length=80)
    is_active: bool = True

    @field_validator("visa_types")
    @classmethod
    def _unique_names(cls, value: list[VisaType]) -> list[VisaType]:
        names = [v.name.lower() for v in value]
        if len(names) != len(set(names)):
            raise ValueError("Visa types must be unique")
        return value


class VisaCountryOut(SeoOut):
    id: uuid.UUID
    country_name: str
    slug: str
    flag_emoji: str | None
    flag_image: str | None = None
    group: str
    description: str | None = None
    visa_type: str
    visa_types: list[VisaType] = []
    requirements: str | None
    fee: float | None
    processing_time: str | None
    is_active: bool

    model_config = {"from_attributes": True}
