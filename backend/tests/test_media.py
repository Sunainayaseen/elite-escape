import io
from pathlib import Path

from PIL import Image

from app.core.cms_config import cms
from app.core.media import upload_root


def make_image(fmt: str = "PNG", size=(1200, 800), mode: str = "RGB") -> bytes:
    buf = io.BytesIO()
    Image.new(mode, size, (30, 140, 190)).save(buf, fmt)
    return buf.getvalue()


def upload(client, headers, data: bytes, name: str = "photo.png", content_type: str = "image/png"):
    return client.post("/api/admin/media", headers=headers, files={"file": (name, data, content_type)})


def test_upload_produces_optimised_webp_and_avif(client, admin_headers):
    res = upload(client, admin_headers, make_image("PNG", (2600, 1300)), "My Holiday Photo!!.PNG")
    assert res.status_code == 201, res.text
    media = res.json()
    assert media["url"].startswith("/uploads/") and media["url"].endswith("-large.webp")
    assert media["thumb_url"].endswith("-thumb.webp") and "my-holiday-photo" in media["url"]
    assert media["mime_type"] == "image/webp" and media["width"] == 1920 and media["height"] == 960
    assert set(media["variants"]) >= {"medium"}

    root = upload_root()
    for url in (media["url"], media["thumb_url"], *media["variants"].values()):
        assert (root / url.removeprefix("/uploads/")).is_file(), url
    with Image.open(root / media["url"].removeprefix("/uploads/")) as img:
        assert img.format == "WEBP" and img.width == 1920
    assert client.get("/api/admin/media").json()[0]["id"] == media["id"]


def test_small_images_are_not_upscaled(client, admin_headers):
    media = upload(client, admin_headers, make_image("JPEG", (640, 480))).json()
    assert media["width"] == 640


def test_metadata_is_stripped(client, admin_headers):
    src = Image.new("RGB", (300, 300), (1, 2, 3))
    exif = Image.Exif()
    exif[0x010E] = "secret description with GPS"
    buf = io.BytesIO()
    src.save(buf, "JPEG", exif=exif)
    media = upload(client, admin_headers, buf.getvalue(), "geo.jpg", "image/jpeg").json()
    stored = (upload_root() / media["url"].removeprefix("/uploads/")).read_bytes()
    assert b"secret description" not in stored


def test_rejects_non_images_whatever_they_claim_to_be(client, admin_headers):
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    assert upload(client, admin_headers, svg, "x.svg", "image/svg+xml").status_code == 422
    assert upload(client, admin_headers, svg, "x.png", "image/png").status_code == 422
    assert upload(client, admin_headers, b"<html><script>alert(1)</script></html>", "x.jpg", "image/jpeg").status_code == 422
    assert upload(client, admin_headers, b"%PDF-1.4 fake", "x.png", "image/png").status_code == 422
    assert upload(client, admin_headers, b"MZ\x90\x00 fake exe", "evil.exe", "application/octet-stream").status_code == 422
    assert upload(client, admin_headers, b"", "empty.png").status_code == 422
    # A real image with a hostile name is stored under a safe, generated name.
    ok = upload(client, admin_headers, make_image(), "../../etc/passwd<script>.png")
    assert ok.status_code == 201
    assert ".." not in ok.json()["url"] and "<" not in ok.json()["url"]
    assert (upload_root() / ok.json()["url"].removeprefix("/uploads/")).resolve().is_relative_to(upload_root())


def test_rejects_truncated_and_tiny_images(client, admin_headers):
    good = make_image("PNG", (500, 500))
    assert upload(client, admin_headers, good[: len(good) // 2]).status_code == 422
    assert upload(client, admin_headers, make_image("PNG", (4, 4))).status_code == 422


def test_rejects_oversized_uploads(client, admin_headers, monkeypatch):
    monkeypatch.setattr(cms, "max_upload_mb", 1)
    res = upload(client, admin_headers, b"\x89PNG" + b"0" * (1024 * 1024 + 10))
    assert res.status_code == 413


def test_rejects_decompression_bombs(client, admin_headers, monkeypatch):
    monkeypatch.setattr(cms, "max_image_pixels", 1_000_000)
    assert upload(client, admin_headers, make_image("PNG", (1500, 1500))).status_code == 422


def test_upload_requires_login_and_csrf(client, seeded):
    data = make_image()
    assert upload(client, {}, data).status_code == 401


def test_alt_text_and_delete_with_usage_protection(client, admin_headers):
    media = upload(client, admin_headers, make_image()).json()
    patched = client.patch(f"/api/admin/media/{media['id']}", headers=admin_headers, json={"alt_text": "  Blue sea  "})
    assert patched.json()["alt_text"] == "Blue sea"

    category_id = client.get("/api/admin/categories", params={"section": "holidays"}).json()[0]["id"]
    pkg = client.post(
        "/api/admin/packages",
        headers=admin_headers,
        json={
            "title": "Uses image", "category_id": category_id, "country": "X", "summary": "s", "price_from": 1, "price_to": 2,
            "duration": "1 day", "main_image": media["url"], "status": "draft",
        },
    ).json()
    blocked = client.delete(f"/api/admin/media/{media['id']}", headers=admin_headers)
    assert blocked.status_code == 409 and "Uses image" in blocked.json()["detail"]

    client.patch(f"/api/admin/packages/{pkg['id']}", headers=admin_headers, json={"position": 1})
    client.put(
        f"/api/admin/packages/{pkg['id']}",
        headers=admin_headers,
        json={
            "title": "Uses image", "category_id": category_id, "country": "X", "summary": "s", "price_from": 1, "price_to": 2,
            "duration": "1 day", "main_image": "https://images.example.com/other.jpg", "status": "draft",
        },
    )
    files = [upload_root() / u.removeprefix("/uploads/") for u in (media["url"], media["thumb_url"])]
    assert all(f.is_file() for f in files)
    assert client.delete(f"/api/admin/media/{media['id']}", headers=admin_headers).status_code == 204
    assert not any(f.exists() for f in files)
    assert client.get("/api/admin/media").json() == []


def test_staff_cannot_delete_media(client, staff_headers):
    media = upload(client, staff_headers, make_image()).json()
    assert client.delete(f"/api/admin/media/{media['id']}", headers=staff_headers).status_code == 403


def test_path_tampering_cannot_delete_outside_upload_root(tmp_path):
    from app.core.media import delete_files

    outside = tmp_path / "keep.txt"
    outside.write_text("keep me")
    root = tmp_path / "uploads"
    root.mkdir()
    delete_files(["/uploads/../keep.txt", "/etc/passwd", "keep.txt"], root=root)
    assert Path(outside).read_text() == "keep me"


def test_uploaded_files_are_served_with_image_content_types(client, admin_headers, tmp_path, monkeypatch):
    """Regression: WebP/AVIF must not be served as text/plain (next/image rejects that)."""
    import mimetypes

    from fastapi.staticfiles import StaticFiles

    from app.main import app

    media = upload(client, admin_headers, make_image()).json()
    mount = next(r for r in app.routes if getattr(r, "path", "") == "/uploads")
    monkeypatch.setattr(mount.app, "all_directories", [upload_root()])  # follow the per-test upload folder
    assert isinstance(mount.app, StaticFiles)
    res = client.get(media["url"])
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/webp"
    assert res.headers["x-content-type-options"] == "nosniff"
    assert "immutable" in res.headers["cache-control"]
    assert mimetypes.guess_type("x.avif")[0] == "image/avif"
    assert client.get("/uploads/../../etc/passwd").status_code == 404
