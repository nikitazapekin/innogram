#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$TF_DIR/.." && pwd)"
TAG="${1:-latest}"

if ! command -v terraform >/dev/null; then
  echo "terraform not found in PATH"
  exit 1
fi

if [[ ! -f "$TF_DIR/terraform.tfstate" ]] && [[ -z "${TF_REGISTRY_ID:-}" ]]; then
  echo "No terraform.tfstate in $TF_DIR and TF_REGISTRY_ID is not set."
  exit 1
fi

if [[ -n "${TF_REGISTRY_ID:-}" ]]; then
  REGISTRY_ID="$TF_REGISTRY_ID"
else
  REGISTRY_ID="$(terraform -chdir="$TF_DIR" output -raw registry_id)"
fi

PREFIX="cr.yandex/${REGISTRY_ID}"

yc container registry configure-docker --quiet 2>/dev/null || yc container registry configure-docker

cd "$ROOT_DIR"

build_and_push() {
  local name="$1"
  local dockerfile="$2"
  local extra_args=("${@:3}")

  docker build -t "${PREFIX}/${name}:${TAG}" -f "$dockerfile" "${extra_args[@]}" .
  docker push "${PREFIX}/${name}:${TAG}"
}

build_and_push core apps/core/Dockerfile
build_and_push auth apps/auth/Dockerfile
build_and_push api-gateway apps/api-gateway/Dockerfile
build_and_push notifications apps/notifications/Dockerfile
build_and_push client apps/client_app/Dockerfile \
  --build-arg "NEXT_PUBLIC_API_GATEWAY_URL=${NEXT_PUBLIC_API_GATEWAY_URL:-http://localhost/api}" \
  --build-arg "NEXT_PUBLIC_CORE_URL=${NEXT_PUBLIC_CORE_URL:-http://localhost/core}" \
  --build-arg "NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=${NEXT_PUBLIC_IMAGE_REMOTE_HOSTS:-localhost}"
