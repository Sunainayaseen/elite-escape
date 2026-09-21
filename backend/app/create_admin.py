"""Create (or reset the password of) an administrator, asking for the password on the terminal.

    python -m app.create_admin --email owner@example.com --name "Owner Name"

The password is typed at a hidden prompt, so it never appears in source code, shell history or
environment files. Running it again for an existing email resets that account's password and
signs it out everywhere.
"""

import argparse
import getpass
import sys

from app.core.security import hash_password, password_problem
from app.database import SessionLocal
from app.models.admin_session import AdminSession
from app.models.user import User, UserRole


def main() -> int:
    parser = argparse.ArgumentParser(description="Create or reset an Elite Escape administrator.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Administrator")
    args = parser.parse_args()
    email = args.email.strip().lower()

    password = getpass.getpass("New password: ")
    if password != getpass.getpass("Repeat password: "):
        print("Passwords do not match.")
        return 1
    problem = password_problem(password)
    if problem:
        print(problem)
        return 1

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            db.add(User(name=args.name, email=email, hashed_password=hash_password(password), role=UserRole.ADMIN))
            print(f"Created administrator {email}")
        else:
            user.hashed_password = hash_password(password)
            user.failed_login_attempts = 0
            user.locked_until = None
            user.is_active = True
            db.query(AdminSession).filter(AdminSession.user_id == user.id).delete(synchronize_session=False)
            print(f"Password reset for {email}")
        db.commit()
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
