import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import String, cast, or_
from sqlalchemy.orm import Session

from app.core.cms_config import cms
from app.core.deps import get_current_user, require_admin
from app.core.media import UploadError, delete_files, process_upload
from app.database import get_db
from app.models.blog_post import BlogPost
from app.models.category import Category
from app.models.destination import Destination
from app.models.media import Media
from app.models.tour_package import TourPackage
from app.models.user import User
from app.models.visa_country import VisaCountry
from app.schemas.media import MediaOut, MediaUpdate

router = APIRouter(prefix="/api/admin/media", tags=["admin-media"])

UPLOAD_CHUNK = 1024 * 256


def _usages(db: Session, media: Media) -> list[str]:
    """Where an image is in use, so it is not deleted out from under a live page."""
    prefix = media.url.rsplit("-", 1)[0] + "-"  # shared by every rendition of this upload
    found: list[str] = []
    checks = [
        ("Package", TourPackage.title, TourPackage.main_image),
        ("Package", TourPackage.title, TourPackage.images),
        ("Destination", Destination.name, Destination.image),
        ("Visa country", VisaCountry.country_name, VisaCountry.flag_image),
        ("Blog post", BlogPost.title, BlogPost.cover_image),
        ("Category", Category.name, Category.image),
    ]
    for label, title_col, image_col in checks:
        rows = db.query(title_col).filter(cast(image_col, String).like(f"%{prefix}%")).limit(5).all()
        found.extend(f"{label}: {title}" for (title,) in rows if f"{label}: {title}" not in found)
    return found


@router.get("", response_model=list[MediaOut], dependencies=[Depends(get_current_user)])
def list_media(
    q: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=120, ge=1, le=300),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Media)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Media.original_name.ilike(like), Media.alt_text.ilike(like)))
    return query.order_by(Media.created_at.desc()).offset(offset).limit(limit).all()


@router.post("", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chunks: list[bytes] = []
    total = 0
    while chunk := await file.read(UPLOAD_CHUNK):
        total += len(chunk)
        if total > cms.max_upload_bytes:
            raise HTTPException(status_code=413, detail=f"Images must be {cms.max_upload_mb} MB or smaller.")
        chunks.append(chunk)
    if total == 0:
        raise HTTPException(status_code=422, detail="The file is empty.")

    try:
        processed = await run_in_threadpool(process_upload, b"".join(chunks), file.filename or "image")
    except UploadError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None

    original = (file.filename or "image").replace("\\", "/").rsplit("/", 1)[-1][:255]
    media = Media(
        url=processed.url,
        thumb_url=processed.thumb_url,
        variants=processed.variants,
        original_name=original,
        mime_type=processed.mime_type,
        size_bytes=processed.size_bytes,
        width=processed.width,
        height=processed.height,
        uploaded_by=user.id,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.patch("/{media_id}", response_model=MediaOut, dependencies=[Depends(get_current_user)])
def update_media(media_id: uuid.UUID, payload: MediaUpdate, db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if media is None:
        raise HTTPException(status_code=404, detail="Image not found")
    media.alt_text = payload.alt_text
    db.commit()
    db.refresh(media)
    return media


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_media(media_id: uuid.UUID, db: Session = Depends(get_db)):
    media = db.get(Media, media_id)
    if media is None:
        raise HTTPException(status_code=404, detail="Image not found")
    used_by = _usages(db, media)
    if used_by:
        raise HTTPException(
            status_code=409,
            detail="This image is still in use (" + "; ".join(used_by) + "). Replace it there first.",
        )
    files = [media.url, media.thumb_url, *media.variants.values()]
    db.delete(media)
    db.commit()
    delete_files(files)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
