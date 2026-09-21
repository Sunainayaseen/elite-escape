import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.booking import BookingStatus
from app.models.inquiry import InquiryStatus
from app.schemas.common import LongText, OptText, Text1

InquiryType = Literal["general", "package", "visa", "other"]


class InquiryIn(BaseModel):
    """Public contact / enquiry form submission. Only name, email and message are required."""

    name: Text1 = Field(min_length=1, max_length=150)
    email: EmailStr
    phone: OptText = Field(default=None, max_length=40)
    message: Text1 = Field(min_length=1, max_length=4000)
    source_page: Text1 = Field(default="contact", max_length=120)
    inquiry_type: InquiryType = "general"
    destination: OptText = Field(default=None, max_length=150)
    travel_start: date | None = None
    travel_end: date | None = None
    travelers: int | None = Field(default=None, ge=1, le=100)
    package_slug: OptText = Field(default=None, max_length=220)
    website: str | None = Field(default=None, max_length=200, description="Honeypot; must stay empty")

    @model_validator(mode="after")
    def _dates_in_order(self):
        if self.travel_start and self.travel_end and self.travel_end < self.travel_start:
            raise ValueError("Return date cannot be before the departure date")
        return self


class InquiryOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str | None
    message: str
    source_page: str
    inquiry_type: str
    destination: str | None
    package_id: uuid.UUID | None
    package_title: str | None = None
    travel_start: date | None
    travel_end: date | None
    travelers: int | None
    status: InquiryStatus
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InquiryPage(BaseModel):
    items: list[InquiryOut]
    total: int
    counts: dict[str, int]


class InquiryUpdate(BaseModel):
    status: InquiryStatus | None = None
    admin_notes: LongText = Field(default=None, max_length=4000)

    @model_validator(mode="after")
    def _something_to_change(self):
        if self.status is None and "admin_notes" not in self.model_fields_set:
            raise ValueError("Provide a status or notes to update")
        return self


class BookingIn(BaseModel):
    customer_name: Text1 = Field(min_length=1, max_length=150)
    email: EmailStr
    phone: Text1 = Field(min_length=3, max_length=40)
    package_slug: Text1 = Field(min_length=1, max_length=220)
    travel_date: date
    travelers: int = Field(default=1, ge=1, le=50)
    notes: OptText = Field(default=None, max_length=2000)
    website: str | None = Field(default=None, max_length=200, description="Honeypot; must stay empty")


class BookingOut(BaseModel):
    id: uuid.UUID
    customer_name: str
    email: str
    phone: str
    package_id: uuid.UUID
    package_title: str
    travel_date: date
    travelers: int
    notes: str | None
    status: BookingStatus
    created_at: datetime


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class SubscribeIn(BaseModel):
    email: EmailStr
    website: str | None = Field(default=None, max_length=200, description="Honeypot; must stay empty")


class SubscriberOut(BaseModel):
    id: uuid.UUID
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OkResponse(BaseModel):
    ok: bool = True
