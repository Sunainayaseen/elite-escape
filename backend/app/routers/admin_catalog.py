import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, require_admin
from app.core.serializers import package_admin_out
from app.core.slug import unique_slug
from app.core.timeutil import utcnow
from app.database import get_db
from app.models.category import Category
from app.models.destination import Destination
from app.models.tour_package import TourPackage
from app.models.visa_country import VisaCountry
from app.schemas.catalog import (
    CategoryIn,
    CategoryOut,
    PackageAdminOut,
    PackageIn,
    PackageStatus,
)
from app.schemas.visa import VisaCountryIn, VisaCountryOut

router = APIRouter(
    prefix="/api/admin",
    tags=["admin-catalog"],
    dependencies=[Depends(get_current_user)],
)


def _get_or_404(db: Session, model, item_id: uuid.UUID, label: str):
    obj = db.get(model, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return obj


# ---- Packages -------------------------------------------------------------------------

_NOT_COLUMNS = {"slug", "itinerary", "country"}


def _apply_package(db: Session, pkg: TourPackage, payload: PackageIn) -> None:
    _get_or_404(db, Category, payload.category_id, "Category")
    country = payload.country
    if payload.destination_id is not None:
        # The place name shown on the site follows the linked destination, so it cannot drift.
        country = _get_or_404(db, Destination, payload.destination_id, "Destination").name
    for key, value in payload.model_dump(exclude=_NOT_COLUMNS).items():
        setattr(pkg, key, value)
    pkg.country = country or ""
    pkg.itinerary = [day.model_dump() for day in payload.itinerary]
    # Publishing an archived package brings it back; drafts and unpublished ones may stay archived.
    if payload.status == "published":
        pkg.deleted_at = None


def _load(db: Session, package_id: uuid.UUID) -> TourPackage:
    pkg = (
        db.query(TourPackage)
        .options(joinedload(TourPackage.category))
        .filter(TourPackage.id == package_id)
        .first()
    )
    if pkg is None:
        raise HTTPException(status_code=404, detail="Package not found")
    return pkg


@router.get("/packages", response_model=list[PackageAdminOut])
def admin_list_packages(
    q: str | None = Query(default=None, max_length=100),
    package_status: PackageStatus | None = Query(default=None, alias="status"),
    archived: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(TourPackage).options(joinedload(TourPackage.category))
    query = query.filter(TourPackage.deleted_at.is_not(None) if archived else TourPackage.deleted_at.is_(None))
    if package_status:
        query = query.filter(TourPackage.status == package_status)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(TourPackage.title.ilike(like), TourPackage.country.ilike(like)))
    packages = query.order_by(TourPackage.position, TourPackage.created_at.desc()).all()
    return [package_admin_out(p) for p in packages]


@router.get("/packages/{package_id}", response_model=PackageAdminOut)
def admin_get_package(package_id: uuid.UUID, db: Session = Depends(get_db)):
    return package_admin_out(_load(db, package_id))


@router.post("/packages", response_model=PackageAdminOut, status_code=status.HTTP_201_CREATED)
def admin_create_package(payload: PackageIn, db: Session = Depends(get_db)):
    pkg = TourPackage(slug=unique_slug(db, TourPackage, payload.slug or payload.title))
    _apply_package(db, pkg, payload)
    db.add(pkg)
    db.commit()
    return package_admin_out(_load(db, pkg.id))


@router.put("/packages/{package_id}", response_model=PackageAdminOut)
def admin_update_package(package_id: uuid.UUID, payload: PackageIn, db: Session = Depends(get_db)):
    pkg = _load(db, package_id)
    _apply_package(db, pkg, payload)
    if payload.slug and payload.slug != pkg.slug:
        pkg.slug = unique_slug(db, TourPackage, payload.slug, exclude_id=pkg.id)
    db.commit()
    return package_admin_out(_load(db, pkg.id))


class PackageQuickUpdate(BaseModel):
    """Small changes from the list view: publish/unpublish, feature, reorder."""

    status: PackageStatus | None = None
    is_featured: bool | None = None
    position: int | None = Field(default=None, ge=0, le=100_000)

    @model_validator(mode="after")
    def _something(self):
        if not self.model_fields_set:
            raise ValueError("Nothing to update")
        return self


@router.patch("/packages/{package_id}", response_model=PackageAdminOut)
def admin_quick_update_package(package_id: uuid.UUID, payload: PackageQuickUpdate, db: Session = Depends(get_db)):
    pkg = _load(db, package_id)
    if payload.status is not None:
        pkg.status = payload.status
        if payload.status == "published":
            pkg.deleted_at = None
    if payload.is_featured is not None:
        pkg.is_featured = payload.is_featured
    if payload.position is not None:
        pkg.position = payload.position
    db.commit()
    return package_admin_out(_load(db, pkg.id))


class ReorderRequest(BaseModel):
    ids: list[uuid.UUID] = Field(min_length=1, max_length=500)


@router.post("/packages/reorder", status_code=status.HTTP_204_NO_CONTENT)
def admin_reorder_packages(payload: ReorderRequest, db: Session = Depends(get_db)):
    """Positions become the order of the list: the first id shows first on the website."""
    found = {p.id: p for p in db.query(TourPackage).filter(TourPackage.id.in_(payload.ids)).all()}
    if len(found) != len(set(payload.ids)):
        raise HTTPException(status_code=422, detail="One of the packages no longer exists")
    for index, package_id in enumerate(payload.ids):
        found[package_id].position = index
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/packages/{package_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_package(package_id: uuid.UUID, permanent: bool = False, db: Session = Depends(get_db)):
    """Default: archive (soft delete). The package leaves the website and the list, but its data is
    kept and it can be restored. `permanent=true` erases an already-archived package for good."""
    pkg = _get_or_404(db, TourPackage, package_id, "Package")
    if not permanent:
        pkg.deleted_at = utcnow()
        pkg.status = "unpublished"
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    if pkg.deleted_at is None:
        raise HTTPException(status_code=409, detail="Archive the package first, then delete it permanently.")
    if pkg.bookings:
        raise HTTPException(status_code=409, detail="This package has bookings and cannot be erased.")
    db.delete(pkg)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/packages/{package_id}/restore", response_model=PackageAdminOut)
def admin_restore_package(package_id: uuid.UUID, db: Session = Depends(get_db)):
    pkg = _load(db, package_id)
    pkg.deleted_at = None  # comes back as unpublished; publishing is a separate, deliberate step
    db.commit()
    return package_admin_out(_load(db, pkg.id))


# ---- Categories -----------------------------------------------------------------------


@router.get("/categories", response_model=list[CategoryOut])
def admin_list_categories(section: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Category)
    if section:
        query = query.filter(Category.section == section)
    return query.order_by(Category.sort_order, Category.name).all()


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def admin_create_category(payload: CategoryIn, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(status_code=409, detail="A category with this name already exists")
    category = Category(
        **payload.model_dump(exclude={"slug"}),
        slug=unique_slug(db, Category, payload.slug or payload.name),
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut)
def admin_update_category(category_id: uuid.UUID, payload: CategoryIn, db: Session = Depends(get_db)):
    category = _get_or_404(db, Category, category_id, "Category")
    clash = db.query(Category).filter(Category.name == payload.name, Category.id != category.id).first()
    if clash:
        raise HTTPException(status_code=409, detail="A category with this name already exists")
    for key, value in payload.model_dump(exclude={"slug"}).items():
        setattr(category, key, value)
    if payload.slug and payload.slug != category.slug:
        category.slug = unique_slug(db, Category, payload.slug, exclude_id=category.id)
    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_category(category_id: uuid.UUID, db: Session = Depends(get_db)):
    category = _get_or_404(db, Category, category_id, "Category")
    if category.packages:
        raise HTTPException(
            status_code=409,
            detail="This category still has packages. Move or delete them first.",
        )
    db.delete(category)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Visa countries -------------------------------------------------------------------


def _visa_fields(payload: VisaCountryIn) -> dict:
    data = payload.model_dump(exclude={"slug"})
    data["visa_types"] = [t.model_dump() for t in payload.visa_types]
    # The headline type shown in lists always mirrors the first visa type.
    data["visa_type"] = payload.visa_types[0].name
    return data


@router.get("/visa-countries", response_model=list[VisaCountryOut])
def admin_list_visa_countries(db: Session = Depends(get_db)):
    return db.query(VisaCountry).order_by(VisaCountry.country_name).all()


@router.get("/visa-countries/{visa_id}", response_model=VisaCountryOut)
def admin_get_visa_country(visa_id: uuid.UUID, db: Session = Depends(get_db)):
    return _get_or_404(db, VisaCountry, visa_id, "Visa country")


@router.post("/visa-countries", response_model=VisaCountryOut, status_code=status.HTTP_201_CREATED)
def admin_create_visa_country(payload: VisaCountryIn, db: Session = Depends(get_db)):
    if db.query(VisaCountry).filter(func.lower(VisaCountry.country_name) == payload.country_name.lower()).first():
        raise HTTPException(status_code=409, detail="This country already exists")
    visa = VisaCountry(
        **_visa_fields(payload),
        slug=unique_slug(db, VisaCountry, payload.slug or payload.country_name),
    )
    db.add(visa)
    db.commit()
    db.refresh(visa)
    return visa


@router.put("/visa-countries/{visa_id}", response_model=VisaCountryOut)
def admin_update_visa_country(visa_id: uuid.UUID, payload: VisaCountryIn, db: Session = Depends(get_db)):
    visa = _get_or_404(db, VisaCountry, visa_id, "Visa country")
    clash = (
        db.query(VisaCountry)
        .filter(func.lower(VisaCountry.country_name) == payload.country_name.lower(), VisaCountry.id != visa.id)
        .first()
    )
    if clash:
        raise HTTPException(status_code=409, detail="This country already exists")
    for key, value in _visa_fields(payload).items():
        setattr(visa, key, value)
    if payload.slug and payload.slug != visa.slug:
        visa.slug = unique_slug(db, VisaCountry, payload.slug, exclude_id=visa.id)
    db.commit()
    db.refresh(visa)
    return visa


@router.delete(
    "/visa-countries/{visa_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_visa_country(visa_id: uuid.UUID, db: Session = Depends(get_db)):
    db.delete(_get_or_404(db, VisaCountry, visa_id, "Visa country"))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# The brief's shorter alias: /api/admin/visa mirrors /api/admin/visa-countries.
router.add_api_route("/visa", admin_list_visa_countries, methods=["GET"], response_model=list[VisaCountryOut])
router.add_api_route(
    "/visa", admin_create_visa_country, methods=["POST"], response_model=VisaCountryOut,
    status_code=status.HTTP_201_CREATED,
)
router.add_api_route("/visa/{visa_id}", admin_get_visa_country, methods=["GET"], response_model=VisaCountryOut)
router.add_api_route("/visa/{visa_id}", admin_update_visa_country, methods=["PUT"], response_model=VisaCountryOut)
router.add_api_route(
    "/visa/{visa_id}", admin_delete_visa_country, methods=["DELETE"],
    status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)],
)
