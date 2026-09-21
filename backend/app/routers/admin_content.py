import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, require_admin
from app.core.site_settings import DEFAULT_SETTINGS, load_settings, validate_settings
from app.core.slug import unique_slug
from app.core.timeutil import utcnow
from app.database import get_db
from app.models.blog_post import BlogPost
from app.models.category import Category
from app.models.site_setting import SiteSetting
from app.schemas.catalog import CategoryOut
from app.schemas.content import BlogCategoryIn, BlogPostIn, BlogPostOut, SettingsUpdate

router = APIRouter(
    prefix="/api/admin",
    tags=["admin-content"],
    dependencies=[Depends(get_current_user)],
)

BLOG_SECTION = "blog"


def _blog_category_or_422(db: Session, category_id: uuid.UUID | None) -> None:
    if category_id is None:
        return
    category = db.get(Category, category_id)
    if category is None or category.section != BLOG_SECTION:
        raise HTTPException(status_code=422, detail="Choose one of the blog categories")


# ---- Blog posts -----------------------------------------------------------------------


@router.get("/blog", response_model=list[BlogPostOut])
def admin_list_posts(
    q: str | None = Query(default=None, max_length=100),
    published: bool | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(BlogPost).options(joinedload(BlogPost.category))
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(BlogPost.title.ilike(like), BlogPost.excerpt.ilike(like)))
    if published is not None:
        query = query.filter(BlogPost.is_published.is_(published))
    return query.order_by(BlogPost.created_at.desc()).all()


@router.get("/blog/{post_id}", response_model=BlogPostOut)
def admin_get_post(post_id: uuid.UUID, db: Session = Depends(get_db)):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/blog", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
def admin_create_post(payload: BlogPostIn, db: Session = Depends(get_db)):
    _blog_category_or_422(db, payload.category_id)
    post = BlogPost(
        **payload.model_dump(exclude={"slug"}),
        slug=unique_slug(db, BlogPost, payload.slug or payload.title),
        published_at=utcnow() if payload.is_published else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/blog/{post_id}", response_model=BlogPostOut)
def admin_update_post(post_id: uuid.UUID, payload: BlogPostIn, db: Session = Depends(get_db)):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    _blog_category_or_422(db, payload.category_id)
    for key, value in payload.model_dump(exclude={"slug"}).items():
        setattr(post, key, value)
    if payload.slug and payload.slug != post.slug:
        post.slug = unique_slug(db, BlogPost, payload.slug, exclude_id=post.id)
    if payload.is_published and post.published_at is None:
        post.published_at = utcnow()
    db.commit()
    db.refresh(post)
    return post


@router.delete(
    "/blog/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_post(post_id: uuid.UUID, db: Session = Depends(get_db)):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Blog categories ------------------------------------------------------------------


@router.get("/blog-categories", response_model=list[CategoryOut])
def admin_list_blog_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .filter(Category.section == BLOG_SECTION)
        .order_by(Category.sort_order, Category.name)
        .all()
    )


@router.post("/blog-categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def admin_create_blog_category(payload: BlogCategoryIn, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(status_code=409, detail="A category with this name already exists")
    next_order = db.query(Category).filter(Category.section == BLOG_SECTION).count()
    category = Category(
        name=payload.name,
        slug=unique_slug(db, Category, payload.name),
        section=BLOG_SECTION,
        description=payload.description,
        sort_order=next_order,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/blog-categories/{category_id}", response_model=CategoryOut)
def admin_update_blog_category(category_id: uuid.UUID, payload: BlogCategoryIn, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if category is None or category.section != BLOG_SECTION:
        raise HTTPException(status_code=404, detail="Category not found")
    clash = db.query(Category).filter(Category.name == payload.name, Category.id != category.id).first()
    if clash:
        raise HTTPException(status_code=409, detail="A category with this name already exists")
    category.name = payload.name
    category.description = payload.description
    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/blog-categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_blog_category(category_id: uuid.UUID, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if category is None or category.section != BLOG_SECTION:
        raise HTTPException(status_code=404, detail="Category not found")
    in_use = db.query(BlogPost).filter(BlogPost.category_id == category.id).count()
    if in_use:
        raise HTTPException(
            status_code=409,
            detail=f"{in_use} post(s) use this category. Move them to another category first.",
        )
    db.delete(category)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Settings -------------------------------------------------------------------------


@router.get("/settings")
def admin_get_settings(db: Session = Depends(get_db)):
    return load_settings(db)


@router.put("/settings", dependencies=[Depends(require_admin)])
def admin_update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    cleaned, errors = validate_settings(payload.values)
    if errors:
        raise HTTPException(status_code=422, detail="\n".join(f"{k}: {v}" for k, v in errors.items()))
    for key, value in cleaned.items():
        row = db.get(SiteSetting, key)
        if row is None:
            db.add(SiteSetting(key=key, value=value))
        else:
            row.value = value
    db.commit()
    return load_settings(db)
