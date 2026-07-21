#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$TF_DIR/.." && pwd)"

export PATH="${HOME}/yandex-cloud/bin:${HOME}/.local/bin:${PATH}"

need() { command -v "$1" >/dev/null || { echo "Need $1 in PATH"; exit 1; }; }
need terraform
need ssh
need scp

cd "$TF_DIR"

VM_IP="$(terraform output -raw vm_external_ip 2>/dev/null || true)"
if [[ -z "$VM_IP" || "$VM_IP" == "null" ]]; then
  echo "No vm_external_ip. Set create_vm=true and run terraform apply."
  exit 1
fi

SSH_USER="${SSH_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-$TF_DIR/.ssh/innogram_ed25519}"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
if [[ -f "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

for i in $(seq 1 30); do
  if ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" "test -f /opt/innogram/.cloud-init-done" 2>/dev/null; then
    break
  fi
  sleep 10
  if [[ $i -eq 30 ]]; then
    echo "Timeout waiting for VM. Try: ssh ${SSH_OPTS[*]} ${SSH_USER}@${VM_IP}"
    exit 1
  fi
done

ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" "command -v docker && docker compose version"

REMOTE_DIR="/opt/innogram/app"
ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" "sudo mkdir -p $REMOTE_DIR && sudo chown -R ${SSH_USER}:${SSH_USER} /opt/innogram"

scp "${SSH_OPTS[@]}" "$ROOT_DIR/docker-compose.yml" "${SSH_USER}@${VM_IP}:${REMOTE_DIR}/docker-compose.yml"

TMP_ENV="$(mktemp)"
trap 'rm -f "$TMP_ENV"' EXIT

if [[ -f "$ROOT_DIR/.env" ]]; then
  cp "$ROOT_DIR/.env" "$TMP_ENV"
else
  cp "$ROOT_DIR/.env.example" "$TMP_ENV"
fi

INFRA="$(ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" "cat /opt/innogram/.env.infra 2>/dev/null || true")"
if [[ -n "$INFRA" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    key="${line%%=*}"
    val="${line#*=}"
    if grep -q "^${key}=" "$TMP_ENV"; then
      sed -i "s|^${key}=.*|${key}=${val}|" "$TMP_ENV"
    else
      echo "${key}=${val}" >> "$TMP_ENV"
    fi
  done <<< "$INFRA"
fi

sed -i "s|^POSTGRES_HOST=.*|POSTGRES_HOST=postgres|" "$TMP_ENV" || true
sed -i "s|^KAFKA_BROKERS=.*|KAFKA_BROKERS=kafka:9092|" "$TMP_ENV" || true
sed -i "s|^MINIO_ENDPOINT=.*|MINIO_ENDPOINT=minio|" "$TMP_ENV" || true
sed -i "s|^CORE_REDIS_URL=.*|CORE_REDIS_URL=redis://redis:6379|" "$TMP_ENV" || true
sed -i "s|^AUTH_REDIS_URL=.*|AUTH_REDIS_URL=redis://redis:6379|" "$TMP_ENV" || true
{
  echo "NEXT_PUBLIC_API_GATEWAY_URL=http://${VM_IP}:3004"
  echo "NEXT_PUBLIC_CORE_URL=http://${VM_IP}:3001"
  echo "NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=${VM_IP}:9000"
  echo "API_GATEWAY_URL=http://gateway:3004"
  echo "AUTH_SERVICE_URL=http://auth:3002"
  echo "CORE_URL=http://core:3001"
  echo "AUTH_CORE_HTTP_URL=http://core:3001"
  echo "RUN_MIGRATIONS=true"
  echo "ALLOWED_ORIGINS=http://${VM_IP}:3000,http://localhost:3000,http://127.0.0.1:3000"
  echo "CLIENT_ORIGIN=http://${VM_IP}:3000"
  echo "AUTH_ALLOWED_OAUTH_REDIRECT_ORIGINS=http://${VM_IP}:3000,http://localhost:3000"
  echo "AUTH_GOOGLE_REDIRECT_URI=http://${VM_IP}:3002/auth/google/callback"
} >> "$TMP_ENV"

scp "${SSH_OPTS[@]}" "$TMP_ENV" "${SSH_USER}@${VM_IP}:${REMOTE_DIR}/.env"

ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" "mkdir -p ${REMOTE_DIR}/apps ${REMOTE_DIR}/packages"
rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude node_modules --exclude dist --exclude .next --exclude coverage \
  --exclude .git --exclude terraform --exclude k8s \
  "$ROOT_DIR/apps/" "${SSH_USER}@${VM_IP}:${REMOTE_DIR}/apps/"
rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude node_modules --exclude dist \
  "$ROOT_DIR/packages/" "${SSH_USER}@${VM_IP}:${REMOTE_DIR}/packages/"

for f in package.json package-lock.json tsconfig.base.json turbo.json .npmrc; do
  if [[ -f "$ROOT_DIR/$f" ]]; then
    scp "${SSH_OPTS[@]}" "$ROOT_DIR/$f" "${SSH_USER}@${VM_IP}:${REMOTE_DIR}/$f"
  fi
done

ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" "cd ${REMOTE_DIR} && docker compose up --build -d"
