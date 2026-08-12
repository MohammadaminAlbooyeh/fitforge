#!/usr/bin/env bash
# Regenerates shared/types/api-contracts.generated.ts from the backend's live OpenAPI schema.
#
# Usage: ./shared/scripts/generate-api-contracts.sh
# Requires: python3 + backend/requirements.txt installed, and `npx` available.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
OUT_DIR="$ROOT_DIR/shared/types"
SCHEMA_FILE="$(mktemp -t openapi-XXXXXX.json)"
trap 'rm -f "$SCHEMA_FILE"' EXIT

echo "==> Exporting OpenAPI schema from backend"
(cd "$BACKEND_DIR" && python3 scripts/export_openapi.py "$SCHEMA_FILE")

echo "==> Generating TypeScript types"
npx --yes openapi-typescript "$SCHEMA_FILE" -o "$OUT_DIR/api-contracts.generated.ts"

echo "==> Done. Generated $OUT_DIR/api-contracts.generated.ts"
