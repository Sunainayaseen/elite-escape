"""Seed the admin user and starter content. Run with: python -m app.seed

Safe to run on every deploy: the admin user is created once, and each content table is only
filled while it is empty, so edits and deletions made in the dashboard are never overwritten.
"""

import json
import secrets
from datetime import datetime, timezone
from pathlib import Path

from app.config import settings
from app.core.security import hash_password, password_problem
from app.core.slug import slugify
from app.database import SessionLocal
from app.models.blog_post import BlogPost
from app.models.category import Category
from app.models.tour_package import TourPackage
from app.models.user import User, UserRole
from app.models.visa_country import VisaCountry
from app.seed_cms import seed_cms
from app.seed_data.content import BLOG_POSTS, VISA_COUNTRIES

DATA_DIR = Path(__file__).parent / "seed_data"


def _load_json(name: str):
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def seed_admin(db) -> None:
    """Create the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD (never a built-in password).

    With no ADMIN_PASSWORD: development gets a random one, printed once; production creates nobody
    and asks you to run `python -m app.create_admin` instead.
    """
    email = settings.admin_email.lower()
    if db.query(User).filter(User.email == email).first():
        return

    password = settings.admin_password
    generated = False
    if not password:
        if settings.is_production:
            print("No admin account exists yet. Set ADMIN_PASSWORD, or run: python -m app.create_admin")
            return
        while True:
            password = secrets.token_urlsafe(12)
            if password_problem(password) is None:
                break
        generated = True
    problem = password_problem(password)
    if problem:
        print(f"Admin account not created: ADMIN_PASSWORD is not acceptable. {problem}")
        return

    db.add(
        User(
            name=settings.admin_name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.ADMIN,
        )
    )
    print(f"Created admin user: {email}")
    if generated:
        print(f"Generated one-time admin password (change it after signing in): {password}")


def seed_categories(db) -> None:
    if db.query(Category).filter(Category.section == "holidays").count():
        return
    for item in _load_json("categories.json"):
        db.add(Category(section="holidays", **item))
    db.flush()


def seed_packages(db) -> None:
    if db.query(TourPackage).count():
        return
    categories = {c.slug: c for c in db.query(Category).all()}
    for item in _load_json("packages.json"):
        category = categories.get(item.pop("category"))
        if category is None:
            continue
        images = item.pop("images", [])
        db.add(
            TourPackage(
                category_id=category.id,
                status="published",
                main_image=images[0] if images else None,
                images=images[1:],
                **item,
            )
        )


def seed_visa_countries(db) -> None:
    if db.query(VisaCountry).count():
        return
    for name, flag, group, visa_type, fee, processing, requirements in VISA_COUNTRIES:
        db.add(
            VisaCountry(
                country_name=name,
                slug=slugify(name),
                flag_emoji=flag,
                group=group,
                visa_type=visa_type,
                visa_types=[{"name": visa_type, "description": None}],
                # 0 and "On enquiry" are the seed's markers for "not published"; store them as empty.
                fee=fee or None,
                processing_time=None if processing == "On enquiry" else processing,
                requirements=requirements,
            )
        )


def seed_blog(db) -> None:
    if db.query(BlogPost).count():
        return
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for post in BLOG_POSTS:
        db.add(BlogPost(slug=slugify(post["title"]), is_published=True, published_at=now, **post))


def replace_catalog(db) -> None:
    """Swap the holiday categories and packages for the bundled, verified ones.

    Used once to clear placeholder data from an older install. Refuses to run if any booking
    already references a package, so real customer records are never orphaned.
    """
    from app.models.booking import Booking

    if db.query(Booking).count():
        raise SystemExit("Refusing to replace the catalog: bookings reference existing packages.")
    db.query(TourPackage).delete()
    db.query(Category).filter(Category.section == "holidays").delete()
    db.flush()


def seed(replace: bool = False) -> None:
    db = SessionLocal()
    try:
        if replace:
            replace_catalog(db)
        seed_admin(db)
        seed_categories(db)
        seed_packages(db)
        seed_visa_countries(db)
        seed_blog(db)
        seed_cms(db)
        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    seed(replace="--replace-catalog" in sys.argv)
