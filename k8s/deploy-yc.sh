#!/usr/bin/env bash
# Deploy Innogram to Yandex Managed Kubernetes.
# Substitutes image registry into manifests (minikube uses local images).
#
# Prerequisites:
#   - kubectl context points to YC cluster
#     yc managed-kubernetes cluster get-credentials <cluster-id> --external --force
#   - Images pushed: ./terraform/scripts/build-and-push.sh
#   - Root .env filled (secrets)
#
# Usage:
#   export IMAGE_PREFIX=cr.yandex/<registry_id>   # or read from terraform
#   ./k8s/deploy-yc.sh apply
#   ./k8s/deploy-yc.sh status
#   ./k8s/deploy-yc.sh delete

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
TF_DIR="$ROOT_DIR/terraform"
TAG="${IMAGE_TAG:-latest}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

resolve_image_prefix() {
  if [[ -n "${IMAGE_PREFIX:-}" ]]; then
    return
  fi
  if [[ -f "$TF_DIR/terraform.tfstate" ]] && command -v terraform >/dev/null; then
    IMAGE_PREFIX="$(terraform -chdir="$TF_DIR" output -raw image_prefix 2>/dev/null || true)"
  fi
  if [[ -z "${IMAGE_PREFIX:-}" ]]; then
    echo -e "${RED}Set IMAGE_PREFIX=cr.yandex/<registry_id> or run terraform apply first.${NC}"
    exit 1
  fi
}

load_env() {
  local env_file="$ROOT_DIR/.env"
  if [[ ! -f "$env_file" ]]; then
    echo -e "${RED}Error: .env not found at $env_file${NC}"
    echo "Copy .env.example to .env and fill secrets."
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
}

# Stream a manifest file, rewriting app images for Container Registry.
render_app_manifest() {
  local file="$1"
  sed \
    -e "s|image: innogram/core:latest|image: ${IMAGE_PREFIX}/core:${TAG}|g" \
    -e "s|image: innogram/auth:latest|image: ${IMAGE_PREFIX}/auth:${TAG}|g" \
    -e "s|image: innogram/api-gateway:latest|image: ${IMAGE_PREFIX}/api-gateway:${TAG}|g" \
    -e "s|image: innogram/notifications:latest|image: ${IMAGE_PREFIX}/notifications:${TAG}|g" \
    -e "s|image: innogram/client:latest|image: ${IMAGE_PREFIX}/client:${TAG}|g" \
    -e "s|imagePullPolicy: Never|imagePullPolicy: IfNotPresent|g" \
    "$file"
}

usage() {
  cat <<'EOF'
Usage: ./k8s/deploy-yc.sh <command>

Commands:
  apply     Apply all manifests (infra + apps) with CR images
  delete    Delete namespace innogram
  status    Show pods / services / ingress
  logs      Tail logs: logs <core|auth|api-gateway|notifications|client|kafka|minio>

Env:
  IMAGE_PREFIX   cr.yandex/<registry_id>  (auto from terraform output if possible)
  IMAGE_TAG      image tag (default: latest)
EOF
}

cmd_apply() {
  resolve_image_prefix
  load_env

  echo -e "${GREEN}Using IMAGE_PREFIX=${IMAGE_PREFIX} TAG=${TAG}${NC}"

  kubectl apply -f "$DIR/00-namespace.yaml"
  kubectl apply -f "$DIR/01-configmap.yaml"
  envsubst < "$DIR/02-secret.yaml" | kubectl apply -f -

  # Infrastructure images come from public registries
  kubectl apply -f "$DIR/03-postgres.yaml"
  kubectl apply -f "$DIR/04-redis.yaml"
  kubectl apply -f "$DIR/05-minio.yaml"
  kubectl apply -f "$DIR/06-kafka.yaml"

  echo "Waiting for infra pods..."
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgres -n innogram --timeout=180s 2>/dev/null || true
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redis -n innogram --timeout=180s 2>/dev/null || true
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=minio -n innogram --timeout=180s 2>/dev/null || true
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kafka -n innogram --timeout=300s 2>/dev/null || true

  for f in 07-core.yaml 08-auth.yaml 09-api-gateway.yaml 10-notifications.yaml 11-client.yaml; do
    render_app_manifest "$DIR/$f" | kubectl apply -f -
  done

  kubectl apply -f "$DIR/12-ingress.yaml"

  echo ""
  echo -e "${YELLOW}If ingress-nginx is not installed yet:${NC}"
  echo "  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx"
  echo "  helm repo update"
  echo "  helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \\"
  echo "    --namespace ingress-nginx --create-namespace \\"
  echo "    --set controller.service.type=LoadBalancer"
  echo ""

  cmd_status
}

cmd_delete() {
  kubectl delete namespace innogram --ignore-not-found
}

cmd_status() {
  echo ""
  echo "=== Pods ==="
  kubectl get pods -n innogram -o wide 2>/dev/null || echo "(none)"
  echo ""
  echo "=== Services ==="
  kubectl get svc -n innogram 2>/dev/null || echo "(none)"
  echo ""
  echo "=== Ingress ==="
  kubectl get ingress -n innogram 2>/dev/null || echo "(none)"
  echo ""
  echo "=== Ingress controller external IP (if installed) ==="
  kubectl get svc -n ingress-nginx ingress-nginx-controller 2>/dev/null || echo "(ingress-nginx not found)"
  echo ""
  echo "=== PVC ==="
  kubectl get pvc -n innogram 2>/dev/null || echo "(none)"
}

cmd_logs() {
  local name=${1:-}
  if [[ -z "$name" ]]; then
    echo "Usage: $0 logs <service-name>"
    exit 1
  fi
  kubectl logs -f -l "app.kubernetes.io/name=$name" -n innogram --tail=100
}

case ${1:-} in
  apply)  cmd_apply ;;
  delete) cmd_delete ;;
  status) cmd_status ;;
  logs)   cmd_logs "${2:-}" ;;
  *)      usage ;;
esac
