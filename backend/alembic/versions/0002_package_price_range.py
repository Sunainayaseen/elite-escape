"""package price range, tour types; drop unverified rating and review count

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-20

The business publishes per-person price ranges and has no verified package ratings, so the single
price, rating and review_count columns are replaced by price_from / price_to / currency and
tour_types / group_size.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("tour_packages") as batch:
        batch.add_column(sa.Column("price_from", sa.Numeric(10, 2), nullable=True))
        batch.add_column(sa.Column("price_to", sa.Numeric(10, 2), nullable=True))
        batch.add_column(sa.Column("currency", sa.String(3), nullable=False, server_default="AED"))
        batch.add_column(sa.Column("tour_types", sa.JSON(), nullable=False, server_default="[]"))
        batch.add_column(sa.Column("group_size", sa.String(60), nullable=True))

    op.execute("UPDATE tour_packages SET price_from = price, price_to = price")

    with op.batch_alter_table("tour_packages") as batch:
        batch.alter_column("price_from", existing_type=sa.Numeric(10, 2), nullable=False)
        batch.alter_column("price_to", existing_type=sa.Numeric(10, 2), nullable=False)
        batch.alter_column("currency", server_default=None, existing_type=sa.String(3))
        batch.alter_column("tour_types", server_default=None, existing_type=sa.JSON())
        batch.drop_column("price")
        batch.drop_column("rating")
        batch.drop_column("review_count")


def downgrade() -> None:
    with op.batch_alter_table("tour_packages") as batch:
        batch.add_column(sa.Column("price", sa.Numeric(10, 2), nullable=True))
        batch.add_column(sa.Column("rating", sa.Numeric(2, 1), nullable=False, server_default="4.5"))
        batch.add_column(sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"))

    op.execute("UPDATE tour_packages SET price = price_from")

    with op.batch_alter_table("tour_packages") as batch:
        batch.alter_column("price", existing_type=sa.Numeric(10, 2), nullable=False)
        batch.drop_column("group_size")
        batch.drop_column("tour_types")
        batch.drop_column("currency")
        batch.drop_column("price_to")
        batch.drop_column("price_from")
