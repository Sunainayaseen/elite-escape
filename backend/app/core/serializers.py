from app.models.booking import Booking
from app.models.tour_package import TourPackage
from app.schemas.catalog import PackageAdminOut, PackageOut
from app.schemas.common import SEO_FIELD_NAMES
from app.schemas.leads import BookingOut


def _images(pkg: TourPackage) -> tuple[str, list[str]]:
    """(main image, gallery without the main image). Packages created before the main/gallery split
    have no main_image, so their first gallery image stands in for it."""
    gallery = [u for u in (pkg.images or []) if u]
    main = pkg.main_image or (gallery[0] if gallery else "")
    return main, [u for u in gallery if u != main]


def _public_fields(pkg: TourPackage) -> dict:
    main, extra = _images(pkg)
    return dict(
        id=pkg.id,
        slug=pkg.slug,
        title=pkg.title,
        category=pkg.category.slug,
        category_id=pkg.category_id,
        category_name=pkg.category.name,
        country=pkg.country,
        summary=pkg.summary,
        description=pkg.description,
        price_from=float(pkg.price_from),
        price_to=float(pkg.price_to),
        currency=pkg.currency,
        duration=pkg.duration,
        tour_types=list(pkg.tour_types or []),
        group_size=pkg.group_size,
        image=main,
        gallery=([main] if main else []) + extra,
        highlights=list(pkg.highlights or []),
        itinerary=pkg.itinerary,
        inclusions=list(pkg.inclusions or []),
        exclusions=list(pkg.exclusions or []),
        accommodation=pkg.accommodation,
        transportation=pkg.transportation,
        optional_experiences=list(pkg.optional_experiences or []),
        important_notes=pkg.important_notes,
        faq=list(pkg.faq or []),
        is_featured=pkg.is_featured,
        is_active=pkg.is_active,
        **{name: getattr(pkg, name) for name in SEO_FIELD_NAMES},
    )


def package_out(pkg: TourPackage) -> PackageOut:
    return PackageOut(**_public_fields(pkg))


def package_admin_out(pkg: TourPackage) -> PackageAdminOut:
    main, extra = _images(pkg)
    return PackageAdminOut(
        **_public_fields(pkg),
        status=pkg.status,
        position=pkg.position,
        destination_id=pkg.destination_id,
        main_image=main or None,
        images=extra,
        deleted_at=pkg.deleted_at,
        created_at=pkg.created_at,
        updated_at=pkg.updated_at,
    )


def booking_out(booking: Booking) -> BookingOut:
    return BookingOut(
        id=booking.id,
        customer_name=booking.customer_name,
        email=booking.email,
        phone=booking.phone,
        package_id=booking.package_id,
        package_title=booking.package.title,
        travel_date=booking.travel_date,
        travelers=booking.travelers,
        notes=booking.notes,
        status=booking.status,
        created_at=booking.created_at,
    )
