import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.core.slug import unique_slug
from app.database import get_db
from app.models.destination import Destination
from app.models.tour_package import TourPackage
from app.schemas.destinations import DestinationIn, DestinationOut

router = APIRouter(
    prefix="/api/admin/destinations",
    tags=["admin-destinations"],
    dependencies=[Depends(get_current_user)],
)


def _out(db: Session, destination: Destination) -> DestinationOut:
    ids = [
        pid
        for (pid,) in db.query(TourPackage.id)
        .filter(TourPackage.destination_id == destination.id)
        .order_by(TourPackage.title)
        .all()
    ]
    out = DestinationOut.model_validate(destination, from_attributes=True)
    out.package_ids = ids
    out.package_count = len(ids)
    return out


def _assign_packages(db: Session, destination: Destination, package_ids: list[uuid.UUID]) -> None:
    wanted = set(package_ids)
    found = {pid for (pid,) in db.query(TourPackage.id).filter(TourPackage.id.in_(wanted)).all()} if wanted else set()
    if found != wanted:
        raise HTTPException(status_code=422, detail="One of the selected packages no longer exists")
    # Unassign packages that were removed from the list, then assign the selected ones.
    db.query(TourPackage).filter(
        TourPackage.destination_id == destination.id, TourPackage.id.notin_(wanted or {uuid.uuid4()})
    ).update({TourPackage.destination_id: None}, synchronize_session=False)
    if wanted:
        # `country` is what the public site prints on package cards, so it follows the destination.
        db.query(TourPackage).filter(TourPackage.id.in_(wanted)).update(
            {TourPackage.destination_id: destination.id, TourPackage.country: destination.name},
            synchronize_session=False,
        )


def _fields(payload: DestinationIn) -> dict:
    return payload.model_dump(exclude={"slug", "package_ids"})


@router.get("", response_model=list[DestinationOut])
def list_destinations(
    q: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    query = db.query(Destination)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Destination.name.ilike(like), Destination.tagline.ilike(like)))
    return [_out(db, d) for d in query.order_by(Destination.sort_order, Destination.name).all()]


@router.get("/{destination_id}", response_model=DestinationOut)
def get_destination(destination_id: uuid.UUID, db: Session = Depends(get_db)):
    destination = db.get(Destination, destination_id)
    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    return _out(db, destination)


@router.post("", response_model=DestinationOut, status_code=status.HTTP_201_CREATED)
def create_destination(payload: DestinationIn, db: Session = Depends(get_db)):
    if db.query(Destination).filter(func.lower(Destination.name) == payload.name.lower()).first():
        raise HTTPException(status_code=409, detail="A destination with this name already exists")
    destination = Destination(**_fields(payload), slug=unique_slug(db, Destination, payload.slug or payload.name))
    db.add(destination)
    db.flush()
    if payload.package_ids:
        _assign_packages(db, destination, payload.package_ids)
    db.commit()
    db.refresh(destination)
    return _out(db, destination)


@router.put("/{destination_id}", response_model=DestinationOut)
def update_destination(destination_id: uuid.UUID, payload: DestinationIn, db: Session = Depends(get_db)):
    destination = db.get(Destination, destination_id)
    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    clash = (
        db.query(Destination)
        .filter(func.lower(Destination.name) == payload.name.lower(), Destination.id != destination.id)
        .first()
    )
    if clash:
        raise HTTPException(status_code=409, detail="A destination with this name already exists")
    renamed = payload.name != destination.name
    for key, value in _fields(payload).items():
        setattr(destination, key, value)
    if payload.slug and payload.slug != destination.slug:
        destination.slug = unique_slug(db, Destination, payload.slug, exclude_id=destination.id)
    if payload.package_ids is not None:
        _assign_packages(db, destination, payload.package_ids)
    elif renamed:
        db.query(TourPackage).filter(TourPackage.destination_id == destination.id).update(
            {TourPackage.country: destination.name}, synchronize_session=False
        )
    db.commit()
    db.refresh(destination)
    return _out(db, destination)


@router.delete("/{destination_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_destination(destination_id: uuid.UUID, db: Session = Depends(get_db)):
    destination = db.get(Destination, destination_id)
    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    # Packages keep existing (and keep their `country` text); they just lose the link.
    db.query(TourPackage).filter(TourPackage.destination_id == destination.id).update(
        {TourPackage.destination_id: None}, synchronize_session=False
    )
    db.delete(destination)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
