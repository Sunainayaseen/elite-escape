from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.destination import Destination
from app.models.tour_package import TourPackage
from app.schemas.destinations import DestinationPublic

router = APIRouter(prefix="/api/destinations", tags=["public"])


def _package_counts(db: Session) -> dict:
    """Published packages per destination, so an empty destination is visibly empty."""
    rows = (
        db.query(TourPackage.destination_id, func.count(TourPackage.id))
        .filter(TourPackage.status == "published", TourPackage.deleted_at.is_(None))
        .filter(TourPackage.destination_id.is_not(None))
        .group_by(TourPackage.destination_id)
        .all()
    )
    return dict(rows)


def _public(destination: Destination, counts: dict) -> DestinationPublic:
    out = DestinationPublic.model_validate(destination, from_attributes=True)
    out.package_count = counts.get(destination.id, 0)
    return out


@router.get("", response_model=list[DestinationPublic])
def list_destinations(db: Session = Depends(get_db)):
    counts = _package_counts(db)
    rows = (
        db.query(Destination)
        .filter(Destination.is_published.is_(True))
        .order_by(Destination.sort_order, Destination.name)
        .all()
    )
    return [_public(d, counts) for d in rows]


@router.get("/{slug}", response_model=DestinationPublic)
def get_destination(slug: str, db: Session = Depends(get_db)):
    destination = (
        db.query(Destination).filter(Destination.slug == slug, Destination.is_published.is_(True)).first()
    )
    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    return _public(destination, _package_counts(db))
