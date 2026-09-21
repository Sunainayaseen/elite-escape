"""CMS starter data: editable business settings and the blog categories.

Idempotent and safe on every deploy: settings that already exist are never overwritten, and blog
categories are only created while there are none.
"""

from sqlalchemy.orm import Session

from app.core.site_settings import seed_default_settings
from app.core.slug import slugify
from app.models.category import Category

BLOG_CATEGORIES = [
    "Travel Guides",
    "Visa Guides",
    "Destination Guides",
    "Travel Tips",
    "Holiday Inspiration",
]


def seed_blog_categories(db: Session) -> None:
    if db.query(Category).filter(Category.section == "blog").count():
        return
    for order, name in enumerate(BLOG_CATEGORIES):
        db.add(Category(name=name, slug=slugify(name), section="blog", sort_order=order))


def seed_cms(db: Session) -> None:
    seed_default_settings(db)
    seed_blog_categories(db)
    db.flush()
