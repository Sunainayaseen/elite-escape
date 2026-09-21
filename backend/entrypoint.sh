#!/bin/sh
set -e

echo "Applying database migrations..."
alembic upgrade head

echo "Seeding initial data..."
python -m app.seed

exec "$@"
