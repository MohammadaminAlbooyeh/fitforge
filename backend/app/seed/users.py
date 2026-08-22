"""Ensures fixed dev/demo accounts always exist, regardless of DB state."""

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.repositories import user_repo

ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "12345678"
ADMIN_FULL_NAME = "Admin"


def seed_admin_user(db: Session) -> bool:
    """Creates the standing admin@admin.com account if it doesn't exist yet.

    Returns True if the account was created, False if it already existed.
    """
    if user_repo.get_user_by_email(db, ADMIN_EMAIL):
        return False
    user_repo.create_user(
        db, ADMIN_EMAIL, hash_password(ADMIN_PASSWORD), ADMIN_FULL_NAME
    )
    return True
