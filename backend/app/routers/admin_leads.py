import uuid
from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, require_admin
from app.core.serializers import booking_out
from app.database import get_db
from app.models.blog_post import BlogPost
from app.models.booking import Booking, BookingStatus
from app.models.destination import Destination
from app.models.inquiry import Inquiry, InquiryStatus
from app.models.subscriber import Subscriber
from app.models.tour_package import TourPackage
from app.models.visa_country import VisaCountry
from app.schemas.leads import (
    BookingOut,
    BookingStatusUpdate,
    InquiryOut,
    InquiryPage,
    InquiryUpdate,
    SubscriberOut,
)

router = APIRouter(
    prefix="/api/admin",
    tags=["admin-leads"],
    dependencies=[Depends(get_current_user)],
)


def _inquiry_out(inquiry: Inquiry, package_title: str | None = None) -> InquiryOut:
    out = InquiryOut.model_validate(inquiry)
    out.package_title = package_title
    return out


def _package_titles(db: Session, inquiries: list[Inquiry]) -> dict[uuid.UUID, str]:
    ids = {i.package_id for i in inquiries if i.package_id}
    if not ids:
        return {}
    return dict(db.query(TourPackage.id, TourPackage.title).filter(TourPackage.id.in_(ids)).all())


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    """Every number here is a live count from the database; nothing is precomputed or invented."""
    by_status = dict(db.query(Inquiry.status, func.count(Inquiry.id)).group_by(Inquiry.status).all())
    recent = db.query(Inquiry).order_by(Inquiry.created_at.desc()).limit(6).all()
    titles = _package_titles(db, recent)
    return {
        "total_packages": db.query(TourPackage).count(),
        "published_packages": db.query(TourPackage).filter(TourPackage.is_active.is_(True)).count(),
        "total_destinations": db.query(Destination).count(),
        "total_visa_countries": db.query(VisaCountry).count(),
        "new_inquiries": by_status.get(InquiryStatus.NEW, 0),
        "total_inquiries": sum(by_status.values()),
        "published_posts": db.query(BlogPost).filter(BlogPost.is_published.is_(True)).count(),
        "subscribers": db.query(Subscriber).count(),
        "inquiries_by_status": {s.value: by_status.get(s, 0) for s in InquiryStatus},
        "recent_inquiries": [
            _inquiry_out(i, titles.get(i.package_id)).model_dump(mode="json") for i in recent
        ],
    }


# ---- Inquiries ------------------------------------------------------------------------


def _filtered(
    db: Session,
    q: str | None,
    inquiry_type: str | None,
    date_from: date | None,
    date_to: date | None,
):
    query = db.query(Inquiry)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Inquiry.name.ilike(like),
                Inquiry.email.ilike(like),
                Inquiry.phone.ilike(like),
                Inquiry.destination.ilike(like),
                Inquiry.message.ilike(like),
            )
        )
    if inquiry_type:
        query = query.filter(Inquiry.inquiry_type == inquiry_type)
    if date_from:
        query = query.filter(Inquiry.created_at >= datetime.combine(date_from, time.min))
    if date_to:
        query = query.filter(Inquiry.created_at <= datetime.combine(date_to, time.max))
    return query


@router.get("/inquiries", response_model=InquiryPage)
def list_inquiries(
    q: str | None = Query(default=None, max_length=100),
    inquiry_status: InquiryStatus | None = Query(default=None, alias="status"),
    inquiry_type: str | None = Query(default=None, alias="type", max_length=20),
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    base = _filtered(db, q, inquiry_type, date_from, date_to)
    # Tab counts ignore the status filter, so every tab always shows its own total.
    counts = dict(
        base.with_entities(Inquiry.status, func.count(Inquiry.id)).group_by(Inquiry.status).all()
    )
    page = base
    if inquiry_status is not None:
        page = page.filter(Inquiry.status == inquiry_status)
    total = page.count()
    rows = page.order_by(Inquiry.created_at.desc()).offset(offset).limit(limit).all()
    titles = _package_titles(db, rows)
    return InquiryPage(
        items=[_inquiry_out(i, titles.get(i.package_id)) for i in rows],
        total=total,
        counts={s.value: counts.get(s, 0) for s in InquiryStatus},
    )


@router.get("/inquiries/{inquiry_id}", response_model=InquiryOut)
def get_inquiry(inquiry_id: uuid.UUID, db: Session = Depends(get_db)):
    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return _inquiry_out(inquiry, _package_titles(db, [inquiry]).get(inquiry.package_id))


@router.put("/inquiries/{inquiry_id}", response_model=InquiryOut)
@router.patch("/inquiries/{inquiry_id}", response_model=InquiryOut)
def update_inquiry(inquiry_id: uuid.UUID, payload: InquiryUpdate, db: Session = Depends(get_db)):
    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    if payload.status is not None:
        inquiry.status = payload.status
    if "admin_notes" in payload.model_fields_set:
        inquiry.admin_notes = payload.admin_notes
    db.commit()
    db.refresh(inquiry)
    return _inquiry_out(inquiry, _package_titles(db, [inquiry]).get(inquiry.package_id))


@router.delete(
    "/inquiries/{inquiry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_inquiry(inquiry_id: uuid.UUID, db: Session = Depends(get_db)):
    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    db.delete(inquiry)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Bookings (legacy: new requests are stored as package inquiries) -------------------


@router.get("/bookings", response_model=list[BookingOut])
def list_bookings(
    booking_status: BookingStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=200, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Booking).options(joinedload(Booking.package))
    if booking_status is not None:
        query = query.filter(Booking.status == booking_status)
    bookings = query.order_by(Booking.created_at.desc()).offset(offset).limit(limit).all()
    return [booking_out(b) for b in bookings]


@router.patch("/bookings/{booking_id}", response_model=BookingOut)
def update_booking_status(
    booking_id: uuid.UUID, payload: BookingStatusUpdate, db: Session = Depends(get_db)
):
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = payload.status
    db.commit()
    db.refresh(booking)
    return booking_out(booking)


@router.delete(
    "/bookings/{booking_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_booking(booking_id: uuid.UUID, db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Subscribers ----------------------------------------------------------------------


@router.get("/subscribers", response_model=list[SubscriberOut])
def list_subscribers(db: Session = Depends(get_db)):
    return db.query(Subscriber).order_by(Subscriber.created_at.desc()).all()


@router.delete(
    "/subscribers/{subscriber_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_subscriber(subscriber_id: uuid.UUID, db: Session = Depends(get_db)):
    subscriber = db.get(Subscriber, subscriber_id)
    if subscriber is None:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    db.delete(subscriber)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
