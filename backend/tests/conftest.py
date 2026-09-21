import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.cms_config import cms
from app.core.security import hash_password
from app.database import Base, get_db
from app.main import app
from app.models.user import User, UserRole
from app.routers import auth as auth_router
from app.routers import public as public_router
from app.seed import seed_blog, seed_categories, seed_packages, seed_visa_countries
from app.seed_cms import seed_cms


@pytest.fixture(autouse=True)
def isolated_uploads(tmp_path, monkeypatch):
    """Every test writes uploads into its own temp folder, never into the project."""
    monkeypatch.setattr(cms, "upload_dir", str(tmp_path / "uploads"))


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autocommit=False, autoflush=False)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    limiters = (
        public_router.lead_limiter,
        public_router.subscribe_limiter,
        auth_router.login_limiter,
        auth_router.forgot_limiter,
        auth_router.reset_limiter,
    )
    for limiter in limiters:
        limiter._hits.clear()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def seeded(db_session):
    seed_categories(db_session)
    seed_packages(db_session)
    seed_visa_countries(db_session)
    seed_blog(db_session)
    seed_cms(db_session)
    db_session.add_all(
        [
            User(name="Admin", email="admin@test.com", hashed_password=hash_password("Password123"), role=UserRole.ADMIN),
            User(name="Staff", email="staff@test.com", hashed_password=hash_password("Password123"), role=UserRole.STAFF),
        ]
    )
    db_session.commit()
    return db_session


def login(client, email: str, password: str = "Password123") -> dict:
    """Sign in (the session cookie is kept by the client) and return the CSRF header for writes."""
    res = client.post("/api/admin/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"X-CSRF-Token": res.json()["csrf_token"]}


@pytest.fixture()
def admin_headers(client, seeded):
    return login(client, "admin@test.com")


@pytest.fixture()
def staff_headers(client, seeded):
    return login(client, "staff@test.com")
