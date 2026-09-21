import json
from datetime import date, timedelta

from app.core.site_settings import DEFAULT_OFFICES
from app.models.site_setting import SiteSetting


def package_payload(category_id: str, **overrides) -> dict:
    payload = {
        "title": "Test Escape",
        "category_id": category_id,
        "country": "Testland",
        "summary": "A test package.",
        "price_from": 999,
        "price_to": 1299,
        "currency": "aed",
        "duration": "3 Nights / 4 Days",
        "tour_types": ["Private"],
        "main_image": "https://images.example.com/main.jpg",
        "images": ["https://images.example.com/g1.jpg", "https://images.example.com/g1.jpg"],
        "highlights": ["One", " Two "],
        "itinerary": [
            {"day": 1, "title": "Arrive", "description": "Land."},
            {"day": 2, "title": "Explore", "description": "See things."},
        ],
        "inclusions": ["Flights"],
        "exclusions": [],
        "accommodation": "3-star hotel",
        "optional_experiences": [{"title": "Desert safari", "description": "Evening drive"}],
        "faq": [{"question": "Visa?", "answer": "We help."}],
        "status": "published",
    }
    payload.update(overrides)
    return payload


def holiday_category_id(client) -> str:
    return client.get("/api/admin/categories", params={"section": "holidays"}).json()[0]["id"]


# ---- Packages -----------------------------------------------------------------------------


def test_package_lifecycle_and_public_visibility(client, admin_headers):
    category_id = holiday_category_id(client)
    before = len(client.get("/api/packages").json())

    created = client.post("/api/admin/packages", headers=admin_headers, json=package_payload(category_id))
    assert created.status_code == 201, created.text
    pkg = created.json()
    assert pkg["slug"] == "test-escape" and pkg["currency"] == "AED"
    assert pkg["highlights"] == ["One", "Two"]
    assert pkg["images"] == ["https://images.example.com/g1.jpg"]  # duplicates removed
    assert pkg["main_image"] == "https://images.example.com/main.jpg"
    assert pkg["itinerary"][1]["title"] == "Explore"

    # Publishing makes it appear on the public site, with main image first in the gallery.
    public = client.get("/api/packages/test-escape").json()
    assert public["image"] == "https://images.example.com/main.jpg"
    assert public["gallery"][0] == public["image"] and len(public["gallery"]) == 2
    assert public["faq"][0]["question"] == "Visa?" and public["accommodation"] == "3-star hotel"
    assert len(client.get("/api/packages").json()) == before + 1

    # Editing a price shows up on the public page straight away.
    edited = client.put(
        f"/api/admin/packages/{pkg['id']}",
        headers=admin_headers,
        json=package_payload(category_id, price_from=1100, price_to=1400, itinerary=[{"day": 1, "title": "Only day", "description": ""}]),
    )
    assert edited.status_code == 200
    assert edited.json()["slug"] == "test-escape"
    public = client.get("/api/packages/test-escape").json()
    assert public["price_from"] == 1100 and public["price_to"] == 1400
    assert [d["title"] for d in public["itinerary"]] == ["Only day"]

    # Unpublish -> gone publicly, still in the admin list.
    unpublished = client.patch(f"/api/admin/packages/{pkg['id']}", headers=admin_headers, json={"status": "unpublished"})
    assert unpublished.json()["status"] == "unpublished" and unpublished.json()["is_active"] is False
    assert client.get("/api/packages/test-escape").status_code == 404
    assert len(client.get("/api/packages").json()) == before
    assert any(p["id"] == pkg["id"] for p in client.get("/api/admin/packages").json())

    # Archive (soft delete): out of the normal list, kept in the archive, restorable.
    assert client.delete(f"/api/admin/packages/{pkg['id']}", headers=admin_headers).status_code == 204
    assert all(p["id"] != pkg["id"] for p in client.get("/api/admin/packages").json())
    archived = client.get("/api/admin/packages", params={"archived": "true"}).json()
    assert [p["id"] for p in archived] == [pkg["id"]]
    restored = client.post(f"/api/admin/packages/{pkg['id']}/restore", headers=admin_headers).json()
    assert restored["deleted_at"] is None and restored["status"] == "unpublished"
    assert client.get("/api/packages/test-escape").status_code == 404  # restoring does not republish

    # Permanent delete only after archiving.
    assert client.delete(f"/api/admin/packages/{pkg['id']}", params={"permanent": "true"}, headers=admin_headers).status_code == 409
    client.delete(f"/api/admin/packages/{pkg['id']}", headers=admin_headers)
    assert client.delete(f"/api/admin/packages/{pkg['id']}", params={"permanent": "true"}, headers=admin_headers).status_code == 204
    assert client.get(f"/api/admin/packages/{pkg['id']}").status_code == 404


def test_draft_packages_are_not_public(client, admin_headers):
    category_id = holiday_category_id(client)
    draft = client.post("/api/admin/packages", headers=admin_headers, json=package_payload(category_id, status="draft")).json()
    assert draft["status"] == "draft"
    assert client.get(f"/api/packages/{draft['slug']}").status_code == 404
    client.patch(f"/api/admin/packages/{draft['id']}", headers=admin_headers, json={"status": "published"})
    assert client.get(f"/api/packages/{draft['slug']}").status_code == 200


def test_package_ordering_and_featured(client, admin_headers):
    listing = client.get("/api/admin/packages").json()
    ids = [p["id"] for p in listing]
    reversed_ids = list(reversed(ids))
    assert client.post("/api/admin/packages/reorder", headers=admin_headers, json={"ids": reversed_ids}).status_code == 204
    assert [p["id"] for p in client.get("/api/admin/packages").json()] == reversed_ids
    assert client.post("/api/admin/packages/reorder", headers=admin_headers, json={"ids": ["00000000-0000-0000-0000-000000000000"]}).status_code == 422
    featured = client.patch(f"/api/admin/packages/{ids[0]}", headers=admin_headers, json={"is_featured": True})
    assert featured.json()["is_featured"] is True
    assert client.patch(f"/api/admin/packages/{ids[0]}", headers=admin_headers, json={}).status_code == 422


def test_package_validation(client, admin_headers):
    category_id = holiday_category_id(client)
    post = lambda **kw: client.post("/api/admin/packages", headers=admin_headers, json=package_payload(category_id, **kw))  # noqa: E731
    assert post(price_from=0).status_code == 422
    assert post(price_from=2000, price_to=1000).status_code == 422
    assert post(main_image=None).status_code == 422
    assert post(main_image="javascript:alert(1)").status_code == 422
    assert post(main_image="//evil.example/x.png").status_code == 422
    assert post(main_image="http://insecure.example/x.png").status_code == 422
    assert post(images=["data:image/png;base64,AAAA"]).status_code == 422
    assert post(currency="DIRHAM").status_code == 422
    assert post(country=None).status_code == 422  # neither destination nor country
    assert post(itinerary=[{"day": 1, "title": "a"}, {"day": 1, "title": "b"}]).status_code == 422
    assert post(status="deleted").status_code == 422
    assert post(main_image="/uploads/2026/09/abc-photo-large.webp").status_code == 201
    missing = client.post("/api/admin/packages", headers=admin_headers, json=package_payload("00000000-0000-0000-0000-000000000000"))
    assert missing.status_code == 404


def test_script_tags_are_stored_as_inert_text_and_control_chars_removed(client, admin_headers):
    category_id = holiday_category_id(client)
    res = client.post(
        "/api/admin/packages",
        headers=admin_headers,
        json=package_payload(category_id, title="Trip\x00 <script>alert(1)</script>", highlights=["a\x07b"]),
    )
    assert res.status_code == 201
    body = res.json()
    assert "\x00" not in body["title"] and body["highlights"] == ["ab"]
    assert body["title"] == "Trip <script>alert(1)</script>"  # rendered escaped by React, never as HTML


def test_staff_can_edit_but_not_delete_or_change_settings(client, staff_headers):
    category_id = holiday_category_id(client)
    created = client.post("/api/admin/packages", headers=staff_headers, json=package_payload(category_id))
    assert created.status_code == 201
    assert client.delete(f"/api/admin/packages/{created.json()['id']}", headers=staff_headers).status_code == 403
    assert client.put("/api/admin/settings", headers=staff_headers, json={"values": {"contact_email": "x@y.com"}}).status_code == 403
    assert client.get("/api/admin/settings").status_code == 200


def test_category_with_packages_cannot_be_deleted(client, admin_headers):
    category_id = holiday_category_id(client)
    assert client.delete(f"/api/admin/categories/{category_id}", headers=admin_headers).status_code == 409
    created = client.post("/api/admin/categories", headers=admin_headers, json={"name": "Empty One"})
    assert created.status_code == 201
    assert client.delete(f"/api/admin/categories/{created.json()['id']}", headers=admin_headers).status_code == 204


# ---- Destinations ---------------------------------------------------------------------------


def test_destination_management_and_package_assignment(client, admin_headers):
    assert client.get("/api/destinations").json() == []
    created = client.post(
        "/api/admin/destinations",
        headers=admin_headers,
        json={"name": "Japan", "description": "Cherry blossoms.", "is_published": False, "seo_title": "Japan tours"},
    )
    assert created.status_code == 201, created.text
    dest = created.json()
    assert dest["slug"] == "japan" and dest["seo_title"] == "Japan tours" and dest["package_count"] == 0
    assert client.post("/api/admin/destinations", headers=admin_headers, json={"name": "japan"}).status_code == 409
    assert client.get("/api/destinations").json() == []  # unpublished destinations stay hidden
    assert client.get("/api/destinations/japan").status_code == 404

    packages = client.get("/api/admin/packages").json()
    japan_pkg = next(p for p in packages if "japan" in p["slug"])
    updated = client.put(
        f"/api/admin/destinations/{dest['id']}",
        headers=admin_headers,
        json={"name": "Japan", "is_published": True, "package_ids": [japan_pkg["id"]]},
    )
    assert updated.status_code == 200 and updated.json()["package_ids"] == [japan_pkg["id"]]
    public = client.get("/api/destinations").json()
    assert [d["slug"] for d in public] == ["japan"] and public[0]["package_count"] == 1

    # Renaming the destination renames the place shown on its packages.
    client.put(f"/api/admin/destinations/{dest['id']}", headers=admin_headers, json={"name": "Nippon", "is_published": True})
    assert client.get(f"/api/packages/{japan_pkg['slug']}").json()["country"] == "Nippon"

    # Unassign, then delete: packages survive.
    client.put(f"/api/admin/destinations/{dest['id']}", headers=admin_headers, json={"name": "Nippon", "package_ids": []})
    assert client.get(f"/api/admin/destinations/{dest['id']}").json()["package_count"] == 0
    assert client.delete(f"/api/admin/destinations/{dest['id']}", headers=admin_headers).status_code == 204
    assert client.get(f"/api/packages/{japan_pkg['slug']}").status_code == 200
    assert client.put(f"/api/admin/destinations/{dest['id']}", headers=admin_headers, json={"name": "x"}).status_code == 404


def test_package_linked_to_destination_follows_its_name(client, admin_headers):
    dest = client.post("/api/admin/destinations", headers=admin_headers, json={"name": "Armenia", "is_published": True}).json()
    category_id = holiday_category_id(client)
    pkg = client.post(
        "/api/admin/packages", headers=admin_headers, json=package_payload(category_id, country=None, destination_id=dest["id"])
    ).json()
    assert pkg["country"] == "Armenia" and pkg["destination_id"] == dest["id"]
    assert client.get("/api/destinations/armenia").json()["package_count"] == 1


# ---- Visa -----------------------------------------------------------------------------------


def test_visa_country_crud_and_verified_only_fields(client, admin_headers):
    payload = {
        "country_name": "Narnia",
        "group": "Visa Assistance",
        "description": "Lion, witch.",
        "visa_types": [{"name": "Tourist", "description": "Up to 30 days"}, {"name": "Business"}],
        "requirements": "Passport\nPhoto",
        "flag_image": "/uploads/2026/09/abc-flag-large.webp",
    }
    created = client.post("/api/admin/visa", headers=admin_headers, json=payload)
    assert created.status_code == 201, created.text
    visa = created.json()
    assert visa["visa_type"] == "Tourist" and len(visa["visa_types"]) == 2
    assert visa["fee"] is None and visa["processing_time"] is None  # nothing invented
    assert client.post("/api/admin/visa-countries", headers=admin_headers, json={**payload, "country_name": "NARNIA"}).status_code == 409
    assert client.post("/api/admin/visa", headers=admin_headers, json={**payload, "country_name": "Empty", "visa_types": []}).status_code == 422

    assert any(v["country_name"] == "Narnia" for v in client.get("/api/visa-countries").json())
    client.put(f"/api/admin/visa/{visa['id']}", headers=admin_headers, json={**payload, "is_active": False, "fee": 45, "processing_time": "5 days"})
    assert all(v["country_name"] != "Narnia" for v in client.get("/api/visa-countries").json())
    assert client.get(f"/api/admin/visa/{visa['id']}").json()["fee"] == 45
    assert client.delete(f"/api/admin/visa/{visa['id']}", headers=admin_headers).status_code == 204


# ---- Inquiries ------------------------------------------------------------------------------


def test_inquiry_management_filters_and_status(client, admin_headers):
    slug = client.get("/api/packages").json()[0]["slug"]
    assert client.post("/api/inquiries", json={"name": "Ali Khan", "email": "ali@example.com", "message": "Hi"}).status_code == 201
    start = (date.today() + timedelta(days=30)).isoformat()
    end = (date.today() + timedelta(days=37)).isoformat()
    client.post(
        "/api/inquiries",
        json={
            "name": "Sara", "email": "sara@example.com", "phone": "+971500000000", "message": "Family trip",
            "inquiry_type": "package", "destination": "Japan", "travel_start": start, "travel_end": end,
            "travelers": 4, "package_slug": slug,
        },
    )
    page = client.get("/api/admin/inquiries").json()
    assert page["total"] == 2 and page["counts"]["new"] == 2
    detail = next(i for i in page["items"] if i["name"] == "Sara")
    assert detail["inquiry_type"] == "package" and detail["travelers"] == 4 and detail["destination"] == "Japan"
    assert detail["package_title"] and detail["status"] == "new"

    assert client.get("/api/admin/inquiries", params={"q": "sara"}).json()["total"] == 1
    assert client.get("/api/admin/inquiries", params={"q": "japan"}).json()["total"] == 1
    assert client.get("/api/admin/inquiries", params={"type": "package"}).json()["total"] == 1

    updated = client.put(
        f"/api/admin/inquiries/{detail['id']}", headers=admin_headers, json={"status": "in_progress", "admin_notes": "Called her."}
    )
    assert updated.status_code == 200 and updated.json()["status"] == "in_progress"
    filtered = client.get("/api/admin/inquiries", params={"status": "in_progress"}).json()
    assert filtered["total"] == 1 and filtered["counts"]["new"] == 1 and filtered["counts"]["in_progress"] == 1
    for value in ("contacted", "completed", "closed", "new"):
        assert client.patch(f"/api/admin/inquiries/{detail['id']}", headers=admin_headers, json={"status": value}).json()["status"] == value
    assert client.put(f"/api/admin/inquiries/{detail['id']}", headers=admin_headers, json={"status": "bogus"}).status_code == 422
    assert client.put(f"/api/admin/inquiries/{detail['id']}", headers=admin_headers, json={}).status_code == 422
    assert client.get("/api/admin/inquiries", params={"date_from": "2999-01-01"}).json()["total"] == 0
    assert client.delete(f"/api/admin/inquiries/{detail['id']}", headers=admin_headers).status_code == 204


# ---- Blog -----------------------------------------------------------------------------------


def test_blog_categories_seo_and_publish_flow(client, admin_headers):
    categories = client.get("/api/admin/blog-categories").json()
    assert [c["name"] for c in categories] == [
        "Travel Guides", "Visa Guides", "Destination Guides", "Travel Tips", "Holiday Inspiration",
    ]
    holiday_names = {c["name"] for c in client.get("/api/categories", params={"section": "holidays"}).json()}
    assert not holiday_names & {c["name"] for c in categories}  # blog categories never leak into holidays

    draft = client.post(
        "/api/admin/blog",
        headers=admin_headers,
        json={
            "title": "Japan visa guide", "content": "Body text", "category_id": categories[1]["id"],
            "seo_title": "Japan visa | Elite Escape", "meta_description": "How to apply.", "cover_image": "/uploads/2026/09/a-cover-large.webp",
        },
    ).json()
    assert draft["published_at"] is None and draft["category"]["name"] == "Visa Guides"
    assert draft["seo_title"] == "Japan visa | Elite Escape"
    assert client.get("/api/blog/japan-visa-guide").status_code == 404

    holiday_id = client.get("/api/admin/categories", params={"section": "holidays"}).json()[0]["id"]
    wrong = client.post("/api/admin/blog", headers=admin_headers, json={"title": "X", "content": "Y", "category_id": holiday_id})
    assert wrong.status_code == 422

    published = client.put(
        f"/api/admin/blog/{draft['id']}", headers=admin_headers,
        json={"title": "Japan visa guide", "content": "Body text", "is_published": True, "category_id": categories[1]["id"]},
    ).json()
    assert published["published_at"] is not None
    public = client.get("/api/blog/japan-visa-guide").json()
    assert public["category"]["slug"] == "visa-guides"

    client.put(f"/api/admin/blog/{draft['id']}", headers=admin_headers, json={"title": "Japan visa guide", "content": "Body text", "is_published": False})
    assert client.get("/api/blog/japan-visa-guide").status_code == 404
    assert client.delete(f"/api/admin/blog/{draft['id']}", headers=admin_headers).status_code == 204

    created = client.post("/api/admin/blog-categories", headers=admin_headers, json={"name": "Family Trips"})
    assert created.status_code == 201
    assert client.post("/api/admin/blog-categories", headers=admin_headers, json={"name": "family trips"}).status_code in (201, 409)
    assert client.delete(f"/api/admin/blog-categories/{created.json()['id']}", headers=admin_headers).status_code == 204


# ---- Settings -------------------------------------------------------------------------------


def test_verified_offices_are_preloaded_and_unchanged(client, seeded):
    offices = json.loads(client.get("/api/settings").json()["offices"])
    assert offices == DEFAULT_OFFICES
    assert offices[0]["address"] == "City Gate Building, Hashtag Business Center, M Floor, Office 16 — Dubai, UAE"
    assert offices[1]["address"].startswith("Office No. 50, Mezzanine Floor, Ashiana Shopping Centre")
    stored = seeded.get(SiteSetting, "offices")
    assert stored is not None and json.loads(stored.value) == DEFAULT_OFFICES


def test_settings_update_validation_and_unknown_keys(client, admin_headers):
    ok = client.put("/api/admin/settings", headers=admin_headers, json={"values": {"contact_email": " hello@example.com ", "youtube_url": "https://youtube.com/@elite", "whatsapp_number": "+971 55 575 3133"}})
    assert ok.status_code == 200
    public = client.get("/api/settings").json()
    assert public["contact_email"] == "hello@example.com" and public["whatsapp_number"] == "971555753133"
    assert json.loads(public["offices"]) == DEFAULT_OFFICES  # untouched by unrelated edits

    for bad in (
        {"contact_email": "not-an-email"},
        {"instagram_url": "javascript:alert(1)"},
        {"facebook_url": "http://insecure.example"},
        {"whatsapp_number": "abc"},
        {"company_name": ""},
        {"offices": "not json"},
        {"offices": "[]"},
        {"evil": "1"},
    ):
        assert client.put("/api/admin/settings", headers=admin_headers, json={"values": bad}).status_code == 422, bad
    cleared = client.put("/api/admin/settings", headers=admin_headers, json={"values": {"tiktok_url": ""}})
    assert cleared.status_code == 200 and cleared.json()["tiktok_url"] == ""

    edited = [{"city": "Dubai Office", "address": "New Tower, Dubai", "phones": ["+971 1"], "note": None}]
    assert client.put("/api/admin/settings", headers=admin_headers, json={"values": {"offices": json.dumps(edited)}}).status_code == 200
    assert json.loads(client.get("/api/settings").json()["offices"])[0]["address"] == "New Tower, Dubai"


# ---- Dashboard ------------------------------------------------------------------------------


def test_dashboard_counts_are_real(client, admin_headers):
    stats = client.get("/api/admin/stats").json()
    assert stats["total_packages"] == 6 and stats["published_packages"] == 6
    assert stats["total_destinations"] == 0 and stats["new_inquiries"] == 0 and stats["published_posts"] == 0
    assert stats["total_visa_countries"] == len(client.get("/api/admin/visa").json())
    client.post("/api/admin/destinations", headers=admin_headers, json={"name": "Bali"})
    client.post("/api/inquiries", json={"name": "A", "email": "a@example.com", "message": "m"})
    package_id = client.get("/api/admin/packages").json()[0]["id"]
    client.patch(f"/api/admin/packages/{package_id}", headers=admin_headers, json={"status": "unpublished"})
    stats = client.get("/api/admin/stats").json()
    assert stats["total_destinations"] == 1 and stats["new_inquiries"] == 1 and stats["published_packages"] == 5
    assert stats["recent_inquiries"][0]["name"] == "A"


# ---- Regression: the dashboard sends explicit nulls for every empty optional field --------------

SEO_NULLS = dict.fromkeys(
    ("seo_title", "meta_description", "og_title", "og_description", "canonical_url", "focus_keyword")
)


def test_every_resource_accepts_explicit_nulls_for_optional_fields(client, admin_headers):
    category_id = holiday_category_id(client)
    package = package_payload(
        category_id,
        slug=None, destination_id=None, description=None, group_size=None, accommodation=None,
        transportation=None, important_notes=None, **SEO_NULLS,
    )
    created = client.post("/api/admin/packages", headers=admin_headers, json=package)
    assert created.status_code == 201, created.text
    assert client.put(f"/api/admin/packages/{created.json()['id']}", headers=admin_headers, json=package).status_code == 200

    destination = {"name": "Nullland", "slug": None, "tagline": None, "description": None, "image": None, "package_ids": None, **SEO_NULLS}
    dest = client.post("/api/admin/destinations", headers=admin_headers, json=destination)
    assert dest.status_code == 201, dest.text
    assert client.put(f"/api/admin/destinations/{dest.json()['id']}", headers=admin_headers, json=destination).status_code == 200

    visa = {
        "country_name": "Nullia", "group": "Visa Assistance", "visa_types": [{"name": "Tourist", "description": None}],
        "slug": None, "flag_emoji": None, "flag_image": None, "description": None, "requirements": None,
        "fee": None, "processing_time": None, **SEO_NULLS,
    }
    v = client.post("/api/admin/visa-countries", headers=admin_headers, json=visa)
    assert v.status_code == 201, v.text
    assert client.put(f"/api/admin/visa-countries/{v.json()['id']}", headers=admin_headers, json=visa).status_code == 200

    post = {"title": "Null post", "content": "Body", "slug": None, "excerpt": None, "cover_image": None, "category_id": None, **SEO_NULLS}
    b = client.post("/api/admin/blog", headers=admin_headers, json=post)
    assert b.status_code == 201, b.text
    assert client.put(f"/api/admin/blog/{b.json()['id']}", headers=admin_headers, json=post).status_code == 200

    category = client.post("/api/admin/categories", headers=admin_headers, json={"name": "Null cat", "description": None, "image": None, "icon": None, "slug": None})
    assert category.status_code == 201, category.text
    bc = client.post("/api/admin/blog-categories", headers=admin_headers, json={"name": "Null blog cat", "description": None})
    assert bc.status_code == 201, bc.text


def test_seo_length_limits_and_blank_strings(client, admin_headers):
    ok = client.post("/api/admin/destinations", headers=admin_headers, json={"name": "Limits", "seo_title": "x" * 160, "meta_description": "   "})
    assert ok.status_code == 201 and ok.json()["meta_description"] is None
    too_long = client.post("/api/admin/destinations", headers=admin_headers, json={"name": "Limits 2", "seo_title": "x" * 161})
    assert too_long.status_code == 422
    assert client.post("/api/admin/destinations", headers=admin_headers, json={"name": "Limits 3", "canonical_url": "http://insecure.example"}).status_code == 422
