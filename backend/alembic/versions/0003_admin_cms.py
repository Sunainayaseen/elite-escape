"""admin dashboard / CMS schema

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-20

Adds: admin sessions + password reset tokens, login lockout columns, destinations, media library,
package status/ordering/soft delete/extra content/SEO and a package_itinerary_days table, inquiry
statuses and richer fields, visa description/types/SEO (fee and processing time become optional), and
blog categories/SEO. Existing rows are migrated in place; nothing is dropped before its data has been
copied to its replacement.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

INQUIRY_STATUSES = ("new", "contacted", "in_progress", "completed", "closed")

SEO_COLUMNS = (
    ("seo_title", 160),
    ("meta_description", 320),
    ("og_title", 160),
    ("og_description", 320),
    ("canonical_url", 500),
    ("focus_keyword", 120),
)


def _seo_columns() -> list[sa.Column]:
    return [sa.Column(name, sa.String(length), nullable=True) for name, length in SEO_COLUMNS]


def _batch(table: str):
    # SQLite cannot ALTER most things in place, so it rebuilds the table; PostgreSQL alters directly.
    sqlite = op.get_bind().dialect.name == "sqlite"
    return op.batch_alter_table(table, recreate="always" if sqlite else "auto")


def upgrade() -> None:
    bind = op.get_bind()

    # ---- new tables ------------------------------------------------------------------
    op.create_table(
        "destinations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("slug", sa.String(140), nullable=False),
        sa.Column("tagline", sa.String(200), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image", sa.String(500), nullable=True),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        *_seo_columns(),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_destinations_slug", "destinations", ["slug"], unique=True)

    op.create_table(
        "admin_sessions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("csrf_token", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("ip", sa.String(64), nullable=True),
        sa.Column("user_agent", sa.String(255), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_admin_sessions_user_id", "admin_sessions", ["user_id"])
    op.create_index("ix_admin_sessions_token_hash", "admin_sessions", ["token_hash"], unique=True)

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_password_reset_tokens_user_id", "password_reset_tokens", ["user_id"])
    op.create_index("ix_password_reset_tokens_token_hash", "password_reset_tokens", ["token_hash"], unique=True)

    op.create_table(
        "media",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("thumb_url", sa.String(500), nullable=False),
        sa.Column("variants", sa.JSON(), nullable=False),
        sa.Column("original_name", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(60), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("alt_text", sa.String(300), nullable=True),
        sa.Column("uploaded_by", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["uploaded_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("url"),
    )
    op.create_index("ix_media_created_at", "media", ["created_at"])

    op.create_table(
        "package_itinerary_days",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("package_id", sa.Uuid(), nullable=False),
        sa.Column("day_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.ForeignKeyConstraint(["package_id"], ["tour_packages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("package_id", "day_number", name="uq_itinerary_package_day"),
    )
    op.create_index("ix_package_itinerary_days_package_id", "package_itinerary_days", ["package_id"])

    # ---- users: login lockout ----------------------------------------------------------
    with _batch("users") as batch:
        batch.add_column(sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0"))
        batch.add_column(sa.Column("locked_until", sa.DateTime(), nullable=True))
        batch.add_column(sa.Column("last_login_at", sa.DateTime(), nullable=True))

    # ---- inquiries: statuses and richer fields -------------------------------------------
    status_enum = sa.Enum(*INQUIRY_STATUSES, name="inquiry_status")
    status_enum.create(bind, checkfirst=True)  # a no-op outside PostgreSQL
    with _batch("inquiries") as batch:
        batch.add_column(sa.Column("inquiry_type", sa.String(20), nullable=False, server_default="general"))
        batch.add_column(sa.Column("destination", sa.String(150), nullable=True))
        batch.add_column(sa.Column("package_id", sa.Uuid(), nullable=True))
        batch.add_column(sa.Column("travel_start", sa.Date(), nullable=True))
        batch.add_column(sa.Column("travel_end", sa.Date(), nullable=True))
        batch.add_column(sa.Column("travelers", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("status", status_enum, nullable=False, server_default="new"))
        batch.add_column(sa.Column("admin_notes", sa.Text(), nullable=True))
        batch.add_column(sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False))
        batch.create_foreign_key(
            "fk_inquiries_package_id", "tour_packages", ["package_id"], ["id"], ondelete="SET NULL"
        )
        batch.create_index("ix_inquiries_inquiry_type", ["inquiry_type"])
        batch.create_index("ix_inquiries_status", ["status"])
        batch.create_index("ix_inquiries_created_at", ["created_at"])
    # Previously resolved enquiries are the ones that were dealt with.
    op.execute(
        sa.text("UPDATE inquiries SET status = 'completed' WHERE is_resolved = :yes").bindparams(yes=True)
    )
    with _batch("inquiries") as batch:
        batch.drop_column("is_resolved")

    # ---- visa countries -----------------------------------------------------------------
    with _batch("visa_countries") as batch:
        batch.add_column(sa.Column("flag_image", sa.String(500), nullable=True))
        batch.add_column(sa.Column("description", sa.Text(), nullable=True))
        batch.add_column(sa.Column("visa_types", sa.JSON(), nullable=False, server_default="[]"))
        for column in _seo_columns():
            batch.add_column(column)
        batch.alter_column("fee", existing_type=sa.Numeric(10, 2), nullable=True)
        batch.alter_column("processing_time", existing_type=sa.String(80), nullable=True)
    visa = sa.table(
        "visa_countries",
        sa.column("id", sa.Uuid()),
        sa.column("visa_type", sa.String()),
        sa.column("visa_types", sa.JSON()),
        sa.column("fee", sa.Numeric()),
        sa.column("processing_time", sa.String()),
    )
    for row in bind.execute(sa.select(visa.c.id, visa.c.visa_type)).all():
        bind.execute(
            visa.update().where(visa.c.id == row.id).values(visa_types=[{"name": row.visa_type, "description": None}])
        )
    # Fee 0 and "On enquiry" were placeholders for "not published"; store them as empty.
    op.execute(visa.update().where(visa.c.fee == 0).values(fee=None))
    op.execute(visa.update().where(visa.c.processing_time == "On enquiry").values(processing_time=None))

    # ---- blog posts ---------------------------------------------------------------------
    with _batch("blog_posts") as batch:
        batch.add_column(sa.Column("category_id", sa.Uuid(), nullable=True))
        batch.add_column(sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False))
        for column in _seo_columns():
            batch.add_column(column)
        batch.create_foreign_key(
            "fk_blog_posts_category_id", "categories", ["category_id"], ["id"], ondelete="SET NULL"
        )
        batch.create_index("ix_blog_posts_category_id", ["category_id"])

    # ---- tour packages ------------------------------------------------------------------
    with _batch("tour_packages") as batch:
        batch.add_column(sa.Column("destination_id", sa.Uuid(), nullable=True))
        batch.add_column(sa.Column("main_image", sa.String(500), nullable=True))
        batch.add_column(sa.Column("accommodation", sa.Text(), nullable=True))
        batch.add_column(sa.Column("transportation", sa.Text(), nullable=True))
        batch.add_column(sa.Column("optional_experiences", sa.JSON(), nullable=False, server_default="[]"))
        batch.add_column(sa.Column("important_notes", sa.Text(), nullable=True))
        batch.add_column(sa.Column("faq", sa.JSON(), nullable=False, server_default="[]"))
        batch.add_column(sa.Column("status", sa.String(20), nullable=False, server_default="draft"))
        batch.add_column(sa.Column("position", sa.Integer(), nullable=False, server_default="0"))
        batch.add_column(sa.Column("deleted_at", sa.DateTime(), nullable=True))
        for column in _seo_columns():
            batch.add_column(column)
        batch.create_foreign_key(
            "fk_tour_packages_destination_id", "destinations", ["destination_id"], ["id"], ondelete="SET NULL"
        )
        batch.create_index("ix_tour_packages_destination_id", ["destination_id"])
        batch.create_index("ix_tour_packages_status", ["status"])
        batch.create_index("ix_tour_packages_position", ["position"])
        batch.create_index("ix_tour_packages_deleted_at", ["deleted_at"])

    packages = sa.table(
        "tour_packages",
        sa.column("id", sa.Uuid()),
        sa.column("images", sa.JSON()),
        sa.column("itinerary", sa.JSON()),
        sa.column("is_active", sa.Boolean()),
        sa.column("status", sa.String()),
        sa.column("main_image", sa.String()),
        sa.column("position", sa.Integer()),
    )
    days = sa.table(
        "package_itinerary_days",
        sa.column("id", sa.Uuid()),
        sa.column("package_id", sa.Uuid()),
        sa.column("day_number", sa.Integer()),
        sa.column("title", sa.String()),
        sa.column("description", sa.Text()),
    )
    import uuid as _uuid

    rows = bind.execute(
        sa.select(packages.c.id, packages.c.images, packages.c.itinerary, packages.c.is_active)
    ).all()
    for position, row in enumerate(rows):
        images = [i for i in (row.images or []) if i]
        bind.execute(
            packages.update()
            .where(packages.c.id == row.id)
            .values(
                status="published" if row.is_active else "unpublished",
                main_image=images[0] if images else None,
                images=images[1:],
                position=position,
            )
        )
        seen: set[int] = set()
        for item in row.itinerary or []:
            number = int(item.get("day", 0))
            if number < 1 or number in seen:
                continue
            seen.add(number)
            bind.execute(
                days.insert().values(
                    id=_uuid.uuid4(),
                    package_id=row.id,
                    day_number=number,
                    title=str(item.get("title", ""))[:200],
                    description=str(item.get("description", "")),
                )
            )

    with _batch("tour_packages") as batch:
        batch.drop_column("itinerary")
        batch.drop_column("is_active")


def downgrade() -> None:
    bind = op.get_bind()
    import uuid as _uuid  # noqa: F401

    # tour_packages: restore itinerary JSON and is_active from the new structures.
    with _batch("tour_packages") as batch:
        batch.add_column(sa.Column("itinerary", sa.JSON(), nullable=False, server_default="[]"))
        batch.add_column(sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
    packages = sa.table(
        "tour_packages",
        sa.column("id", sa.Uuid()),
        sa.column("images", sa.JSON()),
        sa.column("itinerary", sa.JSON()),
        sa.column("is_active", sa.Boolean()),
        sa.column("status", sa.String()),
        sa.column("main_image", sa.String()),
        sa.column("deleted_at", sa.DateTime()),
    )
    days = sa.table(
        "package_itinerary_days",
        sa.column("package_id", sa.Uuid()),
        sa.column("day_number", sa.Integer()),
        sa.column("title", sa.String()),
        sa.column("description", sa.Text()),
    )
    for row in bind.execute(
        sa.select(packages.c.id, packages.c.images, packages.c.main_image, packages.c.status, packages.c.deleted_at)
    ).all():
        itinerary = [
            {"day": d.day_number, "title": d.title, "description": d.description}
            for d in bind.execute(
                sa.select(days.c.day_number, days.c.title, days.c.description)
                .where(days.c.package_id == row.id)
                .order_by(days.c.day_number)
            ).all()
        ]
        images = ([row.main_image] if row.main_image else []) + list(row.images or [])
        bind.execute(
            packages.update()
            .where(packages.c.id == row.id)
            .values(
                itinerary=itinerary,
                images=images,
                is_active=row.status == "published" and row.deleted_at is None,
            )
        )
    with _batch("tour_packages") as batch:
        for index in ("deleted_at", "position", "status", "destination_id"):
            batch.drop_index(f"ix_tour_packages_{index}")
        batch.drop_constraint("fk_tour_packages_destination_id", type_="foreignkey")
        for name in (
            "destination_id", "main_image", "accommodation", "transportation", "optional_experiences",
            "important_notes", "faq", "status", "position", "deleted_at",
            *(n for n, _ in SEO_COLUMNS),
        ):
            batch.drop_column(name)
    op.drop_table("package_itinerary_days")

    with _batch("blog_posts") as batch:
        batch.drop_index("ix_blog_posts_category_id")
        batch.drop_constraint("fk_blog_posts_category_id", type_="foreignkey")
        for name in ("category_id", "updated_at", *(n for n, _ in SEO_COLUMNS)):
            batch.drop_column(name)

    with _batch("visa_countries") as batch:
        for name in ("flag_image", "description", "visa_types", *(n for n, _ in SEO_COLUMNS)):
            batch.drop_column(name)
        # fee / processing_time stay nullable: NULLs cannot be turned back into meaningful values.

    with _batch("inquiries") as batch:
        batch.add_column(sa.Column("is_resolved", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.execute(
        sa.text("UPDATE inquiries SET is_resolved = :yes WHERE status IN ('completed', 'closed')").bindparams(yes=True)
    )
    with _batch("inquiries") as batch:
        batch.drop_index("ix_inquiries_created_at")
        batch.drop_index("ix_inquiries_status")
        batch.drop_index("ix_inquiries_inquiry_type")
        batch.drop_constraint("fk_inquiries_package_id", type_="foreignkey")
        for name in (
            "inquiry_type", "destination", "package_id", "travel_start", "travel_end",
            "travelers", "status", "admin_notes", "updated_at",
        ):
            batch.drop_column(name)
    sa.Enum(name="inquiry_status").drop(bind, checkfirst=True)

    with _batch("users") as batch:
        for name in ("failed_login_attempts", "locked_until", "last_login_at"):
            batch.drop_column(name)

    op.drop_table("media")
    op.drop_table("password_reset_tokens")
    op.drop_table("admin_sessions")
    op.drop_table("destinations")
