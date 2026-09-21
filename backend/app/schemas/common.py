import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_IMAGE_PATH = re.compile(r"^/(?!/)[A-Za-z0-9._~%/\-]+$")
_HTTPS_URL = re.compile(r"^https://[^\s<>\"'`\\]+$")


def _clean(value: str) -> str:
    return _CONTROL_CHARS.sub("", value).strip()


def _clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    value = _clean(value)
    return value or None


def _image_url(value: str | None) -> str | None:
    """Images are either our own files ("/uploads/..", "/packages/..") or absolute https URLs.
    Anything else (javascript:, data:, protocol-relative //host, http://) is rejected."""
    value = _clean_optional(value)
    if value is None:
        return None
    if len(value) > 500 or not (_IMAGE_PATH.match(value) or _HTTPS_URL.match(value)):
        raise ValueError("Use an uploaded image or a full https:// image address")
    return value


def _https_url(value: str | None) -> str | None:
    value = _clean_optional(value)
    if value is None:
        return None
    if len(value) > 500 or not _HTTPS_URL.match(value):
        raise ValueError("Must be a full https:// address")
    return value


def _max_len(limit: int):
    """Length check that tolerates None (an explicit null is how the dashboard says "empty")."""

    def check(value: str | None) -> str | None:
        if value is not None and len(value) > limit:
            raise ValueError(f"Must be {limit} characters or fewer")
        return value

    return check


def _text_list(values: list[str]) -> list[str]:
    return [c for c in (_clean(v) for v in values) if c]


# Single-line text: control characters removed, whitespace trimmed. Never interpreted as HTML: the
# dashboard and the public site render everything through React, which escapes it.
Text1 = Annotated[str, AfterValidator(_clean)]
OptText = Annotated[str | None, AfterValidator(_clean_optional)]
ImageUrl = Annotated[str | None, AfterValidator(_image_url)]
HttpsUrl = Annotated[str | None, AfterValidator(_https_url)]
TextList = Annotated[list[str], AfterValidator(_text_list)]


def multiline(value: str | None) -> str | None:
    """Multi-line text: keeps newlines/tabs, drops other control characters, normalises line endings."""
    if value is None:
        return None
    value = _CONTROL_CHARS.sub("", value.replace("\r\n", "\n").replace("\r", "\n")).strip()
    return value or None


LongText = Annotated[str | None, AfterValidator(multiline)]


class SeoFields(BaseModel):
    """SEO fields shared by destinations, visa countries, blog posts and packages."""

    seo_title: Annotated[str | None, AfterValidator(_clean_optional), AfterValidator(_max_len(160))] = None
    meta_description: Annotated[str | None, AfterValidator(_clean_optional), AfterValidator(_max_len(320))] = None
    og_title: Annotated[str | None, AfterValidator(_clean_optional), AfterValidator(_max_len(160))] = None
    og_description: Annotated[str | None, AfterValidator(_clean_optional), AfterValidator(_max_len(320))] = None
    canonical_url: HttpsUrl = None
    focus_keyword: Annotated[str | None, AfterValidator(_clean_optional), AfterValidator(_max_len(120))] = None


class SeoOut(BaseModel):
    seo_title: str | None = None
    meta_description: str | None = None
    og_title: str | None = None
    og_description: str | None = None
    canonical_url: str | None = None
    focus_keyword: str | None = None


SEO_FIELD_NAMES = tuple(SeoFields.model_fields)
