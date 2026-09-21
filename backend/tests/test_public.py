from datetime import date, timedelta

from app.models.booking import Booking
from app.models.inquiry import Inquiry
from app.models.subscriber import Subscriber


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_categories_and_packages_match_seed(client, seeded):
    categories = client.get("/api/categories", params={"section": "holidays"}).json()
    assert [c["slug"] for c in categories] == ["asia", "europe", "caucasus"]

    packages = client.get("/api/packages").json()
    assert len(packages) == 6
    paris = next(p for p in packages if p["slug"] == "paris-france-tour-package")
    assert paris["category"] == "europe"
    assert paris["currency"] == "AED"
    assert paris["price_from"] <= paris["price_to"]
    assert paris["image"] == paris["gallery"][0]
    assert paris["itinerary"][0]["day"] == 1
    assert paris["is_featured"] is True
    assert not {"price", "rating", "reviews"} & set(paris)


def test_package_filters(client, seeded):
    by_category = client.get("/api/packages", params={"category": "europe"}).json()
    assert {p["category"] for p in by_category} == {"europe"}
    assert len(by_category) == 3
    featured = client.get("/api/packages", params={"featured": "true"}).json()
    assert len(featured) == 5
    found = client.get("/api/packages", params={"search": "japan"}).json()
    assert [p["slug"] for p in found] == ["japan-tour-package"]


def test_package_detail_and_404(client, seeded):
    assert client.get("/api/packages/paris-france-tour-package").status_code == 200
    assert client.get("/api/packages/nope").status_code == 404


def test_visa_countries_are_listed_without_invented_fees(client, seeded):
    visas = client.get("/api/visa-countries", params={"group": "Visa Assistance"}).json()
    assert len(visas) == 10
    assert {"United States", "France", "Georgia"} <= {v["country_name"] for v in visas}
    assert client.get("/api/visa-countries", params={"search": "canada"}).json()[0]["country_name"] == "Canada"


def test_blog_only_lists_published_posts(client, seeded):
    assert client.get("/api/blog").json() == []
    assert client.get("/api/blog/missing").status_code == 404


def test_public_settings_have_defaults(client):
    data = client.get("/api/settings").json()
    assert data["contact_email"] == "info@eliteescapetourism.com"


def test_create_inquiry(client, db_session):
    res = client.post(
        "/api/inquiries",
        json={"name": "Ali", "email": "ali@example.com", "message": "Hello", "source_page": "contact"},
    )
    assert res.status_code == 201
    saved = db_session.query(Inquiry).one()
    assert saved.name == "Ali" and saved.status.value == "new" and saved.inquiry_type == "general"


def test_inquiry_validation(client):
    res = client.post("/api/inquiries", json={"name": "Ali", "email": "not-an-email", "message": "Hi"})
    assert res.status_code == 422


def test_honeypot_is_silently_dropped(client, db_session):
    res = client.post(
        "/api/inquiries",
        json={"name": "Bot", "email": "bot@example.com", "message": "spam", "website": "http://spam"},
    )
    assert res.status_code == 201
    assert db_session.query(Inquiry).count() == 0


def test_inquiry_rate_limit(client):
    payload = {"name": "Ali", "email": "ali@example.com", "message": "Hello"}
    codes = [client.post("/api/inquiries", json=payload).status_code for _ in range(10)]
    assert codes[:8] == [201] * 8
    assert codes[8] == 429


def test_package_inquiry_stores_structured_fields(client, seeded):
    start = (date.today() + timedelta(days=30)).isoformat()
    res = client.post(
        "/api/inquiries",
        json={
            "name": "Sara",
            "email": "sara@example.com",
            "phone": "+971500000000",
            "message": "Two adults, flexible on hotel.",
            "source_page": "package:paris-france-tour-package",
            "package_slug": "paris-france-tour-package",
            "travel_start": start,
            "travelers": 2,
        },
    )
    assert res.status_code == 201, res.text
    saved = seeded.query(Inquiry).one()
    assert saved.inquiry_type == "package"
    assert saved.package_id is not None
    assert saved.destination == "Paris, France Tour Package"
    assert saved.travelers == 2 and saved.travel_start.isoformat() == start


def test_inquiry_with_unknown_package_or_past_date_is_rejected(client, seeded):
    base = {"name": "Sara", "email": "sara@example.com", "message": "Hi"}
    assert client.post("/api/inquiries", json={**base, "package_slug": "nope"}).status_code == 404
    past = (date.today() - timedelta(days=1)).isoformat()
    assert client.post("/api/inquiries", json={**base, "travel_start": past}).status_code == 422
    reversed_dates = {
        "travel_start": (date.today() + timedelta(days=20)).isoformat(),
        "travel_end": (date.today() + timedelta(days=10)).isoformat(),
    }
    assert client.post("/api/inquiries", json={**base, **reversed_dates}).status_code == 422


def test_legacy_booking_endpoint_creates_a_package_inquiry(client, seeded):
    travel = (date.today() + timedelta(days=30)).isoformat()
    res = client.post(
        "/api/bookings",
        json={
            "customer_name": "Sara",
            "email": "sara@example.com",
            "phone": "+971500000000",
            "package_slug": "paris-france-tour-package",
            "travel_date": travel,
            "travelers": 2,
        },
    )
    assert res.status_code == 201
    assert seeded.query(Booking).count() == 0
    inquiry = seeded.query(Inquiry).one()
    assert inquiry.inquiry_type == "package" and inquiry.travelers == 2
    assert inquiry.phone == "+971500000000"
    assert "Paris" in inquiry.message


def test_booking_rejects_past_date_and_unknown_package(client, seeded):
    base = {"customer_name": "Sara", "email": "sara@example.com", "phone": "+971500000000"}
    past = (date.today() - timedelta(days=1)).isoformat()
    res = client.post("/api/bookings", json={**base, "package_slug": "paris-france-tour-package", "travel_date": past})
    assert res.status_code == 422
    future = (date.today() + timedelta(days=10)).isoformat()
    res = client.post("/api/bookings", json={**base, "package_slug": "nope", "travel_date": future})
    assert res.status_code == 404


def test_newsletter_is_idempotent(client, db_session):
    for _ in range(3):
        assert client.post("/api/newsletter", json={"email": "Fan@Example.com"}).status_code == 201
    assert db_session.query(Subscriber).count() == 1
    assert db_session.query(Subscriber).one().email == "fan@example.com"
