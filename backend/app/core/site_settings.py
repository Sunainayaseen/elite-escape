import json
import re

from pydantic import BaseModel, Field, TypeAdapter, ValidationError, EmailStr
from sqlalchemy.orm import Session

from app.models.site_setting import SiteSetting
from app.schemas.common import _CONTROL_CHARS

# The agency's verified offices, copied verbatim from the live site. They are preloaded into the
# database on first run and are only ever changed by an administrator from Settings.
DEFAULT_OFFICES = [
    {
        "city": "Dubai Office",
        "address": "City Gate Building, Hashtag Business Center, M Floor, Office 16 — Dubai, UAE",
        "phones": ["+971 55 575 3133"],
        "note": "1 hr 32 min from Dubai city centre",
    },
    {
        "city": "Pakistan Office",
        "address": "Office No. 50, Mezzanine Floor, Ashiana Shopping Centre, Main Boulevard, Gulberg III, Lahore, Pakistan",
        "phones": ["+92 302 9198 308"],
        "note": None,
    },
]

DEFAULT_SETTINGS: dict[str, str] = {
    "company_name": "Elite Escape Tourism",
    "contact_email": "info@eliteescapetourism.com",
    "phone": "+971 55 575 3133",
    "whatsapp_number": "971555753133",
    "working_hours": "Working Days: Monday – Friday (9AM – 5PM)",
    "instagram_url": "https://www.instagram.com/eliteescapetourism/",
    "facebook_url": "https://www.facebook.com/eliteescapetourism/",
    "x_url": "https://x.com/EliteEscapeTour",
    "youtube_url": "",
    "linkedin_url": "",
    "tiktok_url": "",
    "offices": json.dumps(DEFAULT_OFFICES, ensure_ascii=False),
}

_HTTPS_URL = re.compile(r"^https://[^\s<>\"'`\\]{3,480}$")
_email = TypeAdapter(EmailStr)


class Office(BaseModel):
    city: str = Field(min_length=1, max_length=80)
    address: str = Field(min_length=1, max_length=300)
    phones: list[str] = Field(default_factory=list, max_length=5)
    note: str | None = Field(default=None, max_length=200)


def _clean(value: str) -> str:
    return _CONTROL_CHARS.sub("", value).strip()


def _text(max_len: int, required: bool = False):
    def check(value: str) -> str:
        if required and not value:
            raise ValueError("This field is required")
        if len(value) > max_len:
            raise ValueError(f"Must be {max_len} characters or fewer")
        return value

    return check


def _url(value: str) -> str:
    if value and not _HTTPS_URL.match(value):
        raise ValueError("Must be a full https:// address (or empty to hide it)")
    return value


def _email_check(value: str) -> str:
    try:
        return str(_email.validate_python(value))
    except ValidationError:
        raise ValueError("Enter a valid email address") from None


def _whatsapp(value: str) -> str:
    digits = re.sub(r"[\s+\-()]", "", value)
    if not re.fullmatch(r"\d{8,15}", digits):
        raise ValueError("Use the full international number, digits only (e.g. 971555753133)")
    return digits


def _offices(value: str) -> str:
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        raise ValueError("Offices must be a valid list") from None
    if not isinstance(parsed, list) or not 1 <= len(parsed) <= 6:
        raise ValueError("Provide between 1 and 6 offices")
    offices = []
    for item in parsed:
        try:
            office = Office.model_validate(item)
        except ValidationError as exc:
            first = exc.errors()[0]
            raise ValueError(f"Office {'.'.join(str(p) for p in first['loc'])}: {first['msg']}") from None
        offices.append(
            {
                "city": _clean(office.city),
                "address": _clean(office.address),
                "phones": [p for p in (_clean(p)[:40] for p in office.phones) if p],
                "note": _clean(office.note) or None if office.note else None,
            }
        )
    return json.dumps(offices, ensure_ascii=False)


VALIDATORS = {
    "company_name": _text(120, required=True),
    "contact_email": _email_check,
    "phone": _text(40),
    "whatsapp_number": _whatsapp,
    "working_hours": _text(200),
    "instagram_url": _url,
    "facebook_url": _url,
    "x_url": _url,
    "youtube_url": _url,
    "linkedin_url": _url,
    "tiktok_url": _url,
    "offices": _offices,
}


def validate_settings(values: dict[str, str]) -> tuple[dict[str, str], dict[str, str]]:
    """Returns (cleaned values, errors keyed by setting name)."""
    cleaned: dict[str, str] = {}
    errors: dict[str, str] = {}
    for key, raw in values.items():
        if key not in DEFAULT_SETTINGS:
            errors[key] = "Unknown setting"
            continue
        try:
            cleaned[key] = VALIDATORS[key](_clean(raw) if key != "offices" else raw)
        except ValueError as exc:
            errors[key] = str(exc)
    return cleaned, errors


def seed_default_settings(db: Session) -> None:
    """Insert any missing setting with its default. Existing rows are never overwritten."""
    existing = {row.key for row in db.query(SiteSetting.key).all()}
    for key, value in DEFAULT_SETTINGS.items():
        if key not in existing:
            db.add(SiteSetting(key=key, value=value))


def load_settings(db: Session) -> dict[str, str]:
    values = dict(DEFAULT_SETTINGS)
    for row in db.query(SiteSetting).all():
        if row.key in DEFAULT_SETTINGS:
            values[row.key] = row.value
    return values
