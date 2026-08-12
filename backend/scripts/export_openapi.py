"""Dump the FastAPI app's OpenAPI schema to a JSON file without booting a server.

Used by CI/local tooling to regenerate the shared TypeScript API contracts
(see shared/scripts/generate-api-contracts.sh).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app

if __name__ == "__main__":
    out_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("openapi.json")
    out_path.write_text(json.dumps(app.openapi(), indent=2))
    print(f"Wrote OpenAPI schema to {out_path}")
