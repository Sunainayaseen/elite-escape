from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.notify import send_staff_email
from app.core.rate_limit import RateLimiter
from app.core.serializers import package_out
from app.core.site_settings import load_settings
from app.database import get_db
from app.models.blog_post import BlogPost
from app.models.category import Category
from app.models.inquiry import Inquiry
from app.models.subscriber import Subscriber
from app.models.tour_package import TourPackage
from app.models.visa_country import VisaCountry
from app.schemas.catalog import CategoryOut, PackageOut
from app.schemas.content import BlogPostOut
from app.schemas.leads import BookingIn, InquiryIn, OkResponse, SubscribeIn
from app.schemas.visa import VisaCountryOut

router = APIRouter(prefix="/api", tags=["public"])

lead_limiter = RateLimiter(max_requests=8, window_seconds=600)
subscribe_limiter = RateLimiter(max_requests=5, window_seconds=600)


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(section: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Category)
    if section:
        query = query.filter(Category.section == section)
    return query.order_by(Category.sort_order, Category.name).all()


@router.get("/packages", response_model=list[PackageOut])
def list_packages(
    category: str | None = None,
    featured: bool | None = None,
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    query = (
        db.query(TourPackage)
        .options(joinedload(TourPackage.category))
        .filter(TourPackage.is_active.is_(True))
    )
    if category:
        query = query.join(Category).filter(Category.slug == category)
    if featured is not None:
        query = query.filter(TourPackage.is_featured.is_(featured))
    if search:
        like = f"%{search}%"
        query = query.filter(or_(TourPackage.title.ilike(like), TourPackage.country.ilike(like)))
    return [package_out(p) for p in query.order_by(TourPackage.position, TourPackage.created_at).all()]


@router.get("/packages/{slug}", response_model=PackageOut)
def get_package(slug: str, db: Session = Depends(get_db)):
    pkg = (
        db.query(TourPackage)
        .options(joinedload(TourPackage.category))
        .filter(TourPackage.slug == slug, TourPackage.is_active.is_(True))
        .first()
    )
    if pkg is None:
        raise HTTPException(status_code=404, detail="Package not found")
    return package_out(pkg)


@router.get("/visa-countries", response_model=list[VisaCountryOut])
def list_visa_countries(
    group: str | None = None,
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    query = db.query(VisaCountry).filter(VisaCountry.is_active.is_(True))
    if group:
        query = query.filter(VisaCountry.group == group)
    if search:
        query = query.filter(VisaCountry.country_name.ilike(f"%{search}%"))
    return query.order_by(VisaCountry.country_name).all()


@router.get("/blog", response_model=list[BlogPostOut])
def list_blog_posts(db: Session = Depends(get_db)):
    return (
        db.query(BlogPost)
        .options(joinedload(BlogPost.category))
        .filter(BlogPost.is_published.is_(True))
        .order_by(BlogPost.published_at.desc())
        .all()
    )


@router.get("/blog/{slug}", response_model=BlogPostOut)
def get_blog_post(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .options(joinedload(BlogPost.category))
        .filter(BlogPost.slug == slug, BlogPost.is_published.is_(True))
        .first()
    )
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/settings")
def public_settings(db: Session = Depends(get_db)):
    return load_settings(db)


def _active_package(db: Session, slug: str) -> TourPackage:
    pkg = db.query(TourPackage).filter(TourPackage.slug == slug, TourPackage.is_active.is_(True)).first()
    if pkg is None:
        raise HTTPException(status_code=404, detail="Package not found")
    return pkg


def _store_inquiry(
    db: Session,
    background: BackgroundTasks,
    *,
    name: str,
    email: str,
    phone: str | None,
    message: str,
    source_page: str,
    inquiry_type: str,
    destination: str | None = None,
    package: TourPackage | None = None,
    travel_start: date | None = None,
    travel_end: date | None = None,
    travelers: int | None = None,
) -> None:
    db.add(
        Inquiry(
            name=name.strip(),
            email=email,
            phone=phone.strip() if phone else None,
            message=message.strip(),
            source_page=source_page,
            inquiry_type=inquiry_type,
            destination=destination or (package.title if package else None),
            package_id=package.id if package else None,
            travel_start=travel_start,
            travel_end=travel_end,
            travelers=travelers,
        )
    )
    db.commit()
    lines = [f"Name: {name}", f"Email: {email}", f"Phone: {phone or '-'}", f"Type: {inquiry_type}"]
    if package:
        lines.append(f"Package: {package.title}")
    if destination:
        lines.append(f"Destination: {destination}")
    if travel_start:
        lines.append(f"Travel: {travel_start}" + (f" to {travel_end}" if travel_end else ""))
    if travelers:
        lines.append(f"Travelers: {travelers}")
    subject = f"New enquiry about {package.title}" if package else f"New enquiry from {name}"
    background.add_task(send_staff_email, subject, "\n".join(lines) + f"\n\n{message}")


@router.post(
    "/inquiries",
    response_model=OkResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(lead_limiter)],
)
def create_inquiry(payload: InquiryIn, background: BackgroundTasks, db: Session = Depends(get_db)):
    if payload.website:
        return OkResponse()
    if payload.travel_start and payload.travel_start < date.today():
        raise HTTPException(status_code=422, detail="Travel date cannot be in the past")
    package = _active_package(db, payload.package_slug) if payload.package_slug else None
    _store_inquiry(
        db,
        background,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
        source_page=payload.source_page,
        inquiry_type="package" if package and payload.inquiry_type == "general" else payload.inquiry_type,
        destination=payload.destination,
        package=package,
        travel_start=payload.travel_start,
        travel_end=payload.travel_end,
        travelers=payload.travelers,
    )
    return OkResponse()


@router.post(
    "/bookings",
    response_model=OkResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(lead_limiter)],
)
def create_booking(payload: BookingIn, background: BackgroundTasks, db: Session = Depends(get_db)):
    """Kept for older clients. A package request is stored as a package inquiry in the single inbox."""
    if payload.website:
        return OkResponse()
    if payload.travel_date < date.today():
        raise HTTPException(status_code=422, detail="Travel date cannot be in the past")
    package = _active_package(db, payload.package_slug)
    _store_inquiry(
        db,
        background,
        name=payload.customer_name,
        email=payload.email,
        phone=payload.phone,
        message=payload.notes or f"I'd like to enquire about {package.title}.",
        source_page=f"package:{package.slug}",
        inquiry_type="package",
        package=package,
        travel_start=payload.travel_date,
        travelers=payload.travelers,
    )
    return OkResponse()


@router.post(
    "/newsletter",
    response_model=OkResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(subscribe_limiter)],
)
def subscribe(payload: SubscribeIn, db: Session = Depends(get_db)):
    if payload.website:
        return OkResponse()
    email = payload.email.lower()
    if db.query(Subscriber).filter(Subscriber.email == email).first() is None:
        db.add(Subscriber(email=email))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
    return OkResponse()
