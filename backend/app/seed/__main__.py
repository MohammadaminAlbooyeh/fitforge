"""Entry point: python -m app.seed"""

from app.database import SessionLocal
from app.seed.exercises import seed_exercises
from app.seed.users import seed_admin_user

if __name__ == "__main__":
    db = SessionLocal()
    try:
        created, updated = seed_exercises(db)
        print(f"Seeded exercise library: {created} created, {updated} updated.")
        admin_created = seed_admin_user(db)
        db.commit()
        print(
            "Created admin@admin.com account."
            if admin_created
            else "admin@admin.com already exists."
        )
    finally:
        db.close()
