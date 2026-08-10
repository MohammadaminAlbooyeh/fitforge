"""Entry point: python -m app.seed"""

from app.database import SessionLocal
from app.seed.exercises import seed_exercises

if __name__ == "__main__":
    db = SessionLocal()
    try:
        created, updated = seed_exercises(db)
        print(f"Seeded exercise library: {created} created, {updated} updated.")
    finally:
        db.close()
