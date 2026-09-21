"""Image upload processing.

Nothing about the uploaded file is trusted: the client's content-type and file extension are ignored,
the bytes are decoded with Pillow, and what gets stored is a freshly encoded WebP (plus an AVIF where
the build supports it). Re-encoding drops EXIF/GPS metadata and any payload hidden in the original.
SVG, HTML, PDF and other non-raster formats are rejected outright, so nothing executable is ever served.
"""

import io
import secrets
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError, features

from app.core.cms_config import cms
from app.core.slug import slugify

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF", "AVIF"}
# Rendition name -> maximum width in pixels (never upscaled).
RENDITIONS = {"large": 1920, "medium": 960, "thumb": 400}
WEBP_QUALITY = 82
AVIF_QUALITY = 60
MIN_SIDE = 16

Image.MAX_IMAGE_PIXELS = cms.max_image_pixels


class UploadError(ValueError):
    """The file was rejected; the message is safe to show to the admin."""


@dataclass
class ProcessedImage:
    url: str
    thumb_url: str
    variants: dict[str, str] = field(default_factory=dict)
    width: int = 0
    height: int = 0
    size_bytes: int = 0
    mime_type: str = "image/webp"


def upload_root() -> Path:
    root = Path(cms.upload_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def _decode(data: bytes) -> Image.Image:
    try:
        probe = Image.open(io.BytesIO(data))
        fmt = probe.format
        if fmt not in ALLOWED_FORMATS:
            raise UploadError("Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded.")
        width, height = probe.size
        if width < MIN_SIDE or height < MIN_SIDE:
            raise UploadError("That image is too small to use.")
        if width * height > cms.max_image_pixels:
            raise UploadError("That image has too many pixels. Please upload a smaller one.")
        probe.verify()  # structural check; the image must be re-opened before it can be read
        image = Image.open(io.BytesIO(data))
        image.load()
    except UploadError:
        raise
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError, ValueError):
        raise UploadError("That file is not a valid image.") from None
    image = ImageOps.exif_transpose(image)
    has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
    return image.convert("RGBA" if has_alpha else "RGB")


def _resized(image: Image.Image, max_width: int) -> Image.Image:
    if image.width <= max_width:
        return image
    height = round(image.height * max_width / image.width)
    return image.resize((max_width, max(height, 1)), Image.Resampling.LANCZOS)


def _encode(image: Image.Image, fmt: str, quality: int) -> bytes:
    buffer = io.BytesIO()
    if fmt == "WEBP":
        image.save(buffer, "WEBP", quality=quality, method=4)
    else:
        image.save(buffer, "AVIF", quality=quality)
    return buffer.getvalue()


def process_upload(data: bytes, original_name: str, root: Path | None = None) -> ProcessedImage:
    image = _decode(data)
    root = root or upload_root()

    now = datetime.now()
    folder = root / f"{now:%Y}" / f"{now:%m}"
    folder.mkdir(parents=True, exist_ok=True)
    stem = slugify(Path(original_name or "image").stem)[:40] or "image"
    base = f"{secrets.token_hex(6)}-{stem}"

    def public_path(filename: str) -> str:
        return f"/uploads/{now:%Y}/{now:%m}/{filename}"

    written: dict[str, str] = {}
    sizes: dict[str, int] = {}
    for name, max_width in RENDITIONS.items():
        payload = _encode(_resized(image, max_width), "WEBP", WEBP_QUALITY)
        filename = f"{base}-{name}.webp"
        (folder / filename).write_bytes(payload)
        written[name] = public_path(filename)
        sizes[name] = len(payload)

    if features.check("avif"):
        try:
            payload = _encode(_resized(image, RENDITIONS["large"]), "AVIF", AVIF_QUALITY)
            filename = f"{base}-large.avif"
            (folder / filename).write_bytes(payload)
            written["avif"] = public_path(filename)
        except Exception:  # AVIF is a bonus; never fail an upload because of it
            pass

    large = _resized(image, RENDITIONS["large"])
    variants = {k: v for k, v in written.items() if k not in ("large", "thumb")}
    return ProcessedImage(
        url=written["large"],
        thumb_url=written["thumb"],
        variants=variants,
        width=large.width,
        height=large.height,
        size_bytes=sizes["large"],
    )


def delete_files(urls: list[str], root: Path | None = None) -> None:
    """Remove stored renditions. Paths are re-anchored under the upload root, so a tampered value
    in the database can never make this delete anything outside it."""
    root = (root or upload_root()).resolve()
    for url in urls:
        if not url.startswith("/uploads/"):
            continue
        target = (root / url.removeprefix("/uploads/")).resolve()
        if root in target.parents and target.is_file():
            target.unlink(missing_ok=True)
