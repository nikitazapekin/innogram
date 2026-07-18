#!/usr/bin/env bash

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

load_env() {
  local env_file="$ROOT_DIR/.env"
  if [[ ! -f "$env_file" ]]; then
    echo -e "${RED}Error: .env file not found at $env_file${NC}"
    echo "Copy .env.example to .env and fill in your values."
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
}

usage() {
  cat <<'EOF'
Usage: ./k8s/deploy.sh <command>

Commands:
  build         Build Docker images into minikube
  apply         Apply all k8s manifests
  delete        Delete all innogram resources
  status        Show pods/services/ingress
  logs <name>   Tail logs (core|auth|api-gateway|notifications|client)
  port-forward   Forward all ports to localhost

Examples:
  ./k8s/deploy.sh build
  ./k8s/deploy.sh apply
  ./k8s/deploy.sh status
  ./k8s/deploy.sh logs core
  ./k8s/deploy.sh port-forward
EOF
}

cmd_build() {
  
  eval $(minikube docker-env)

   
  docker build -t innogram/core:latest -f apps/core/Dockerfile .

  
  docker build -t innogram/auth:latest -f apps/auth/Dockerfile .

  
  docker build -t innogram/api-gateway:latest -f apps/api-gateway/Dockerfile .

  
  docker build -t innogram/notifications:latest -f apps/notifications/Dockerfile .

  
  docker build -t innogram/client:latest \
    --build-arg NEXT_PUBLIC_API_GATEWAY_URL=http://api-gateway:3004 \
    --build-arg NEXT_PUBLIC_CORE_URL=http://core:3001 \
    --build-arg NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=minio:9000 \
    -f apps/client_app/Dockerfile .

 
}

cmd_apply() {
  load_env

  kubectl apply -f "$DIR/00-namespace.yaml"
  kubectl apply -f "$DIR/01-configmap.yaml"

  # Generate secret from .env via envsubst
  envsubst < "$DIR/02-secret.yaml" | kubectl apply -f -

  kubectl apply -f "$DIR/03-postgres.yaml"
  kubectl apply -f "$DIR/04-redis.yaml"
  kubectl apply -f "$DIR/05-minio.yaml"
  kubectl apply -f "$DIR/06-kafka.yaml"

  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgres -n innogram --timeout=120s 2>/dev/null || true
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redis -n innogram --timeout=120s 2>/dev/null || true

  kubectl apply -f "$DIR/07-core.yaml"
  kubectl apply -f "$DIR/08-auth.yaml"
  kubectl apply -f "$DIR/09-api-gateway.yaml"
  kubectl apply -f "$DIR/10-notifications.yaml"
  kubectl apply -f "$DIR/11-client.yaml"
  kubectl apply -f "$DIR/12-ingress.yaml"

 
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/part-of=innogram -n innogram --timeout=180s 2>/dev/null || true

 
  cmd_status
}

cmd_delete() {
 
  kubectl delete namespace innogram --ignore-not-found
  
}

cmd_status() {
  echo ""
 
  kubectl get pods -n innogram -o wide 2>/dev/null || echo "(none)"
  echo ""
 
  kubectl get svc -n innogram 2>/dev/null || echo "(none)"
  echo ""
 
  kubectl get ingress -n innogram 2>/dev/null || echo "(none)"
  echo ""
 
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

cmd_port_forward() {
 

  kubectl port-forward -n innogram svc/client 3000:3000 &
  kubectl port-forward -n innogram svc/core 3001:3001 &
  kubectl port-forward -n innogram svc/auth 3002:3002 &
  kubectl port-forward -n innogram svc/api-gateway 3004:3004 &
  kubectl port-forward -n innogram svc/notifications 3005:3005 &
  kubectl port-forward -n innogram svc/minio 9000:9000 9001:9001 &
  kubectl port-forward -n innogram svc/postgres 5432:5432 &
  kubectl port-forward -n innogram svc/redis 6379:6379 &
  wait
}

case ${1:-} in
  build)       cmd_build ;;
  apply)       cmd_apply ;;
  delete)      cmd_delete ;;
  status)      cmd_status ;;
  logs)        cmd_logs "${2:-}" ;;
  port-forward) cmd_port_forward ;;
  *)           usage ;;
esac
