#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

: "${HEAVYDB_IMAGE:=docker.io/heavyai/scantest:latest}"
: "${HEAVYDB_RESOURCE_SUFFIX:?HEAVYDB_RESOURCE_SUFFIX is required}"

resource_suffix="$(tr -cd '[:alnum:]_-' <<<"${HEAVYDB_RESOURCE_SUFFIX}")"
readonly container_name="immerse-puppeteer-heavydb-${resource_suffix}"

docker pull "${HEAVYDB_IMAGE}"
docker rm --force "${container_name}" 2>/dev/null || true

docker_args=(
  --detach
  --name "${container_name}"
  --ipc host
  --publish 127.0.0.1:6273:6273
  --publish 127.0.0.1:6274:6274
  --publish 127.0.0.1:6278:6278
  --publish 127.0.0.1:6279:6279
)
container_command=()

# The image's default entrypoint is preferred. This override provides a
# temporary escape hatch until the private image's runtime contract is known.
if [[ -n "${HEAVYDB_START_COMMAND:-}" ]]; then
  docker_args+=(--entrypoint bash)
  container_command=(-lc "${HEAVYDB_START_COMMAND}")
fi

docker run \
  "${docker_args[@]}" \
  "${HEAVYDB_IMAGE}" \
  "${container_command[@]}" >/dev/null

ready=false
for _ in $(seq 1 150); do
  if ! docker inspect "${container_name}" --format '{{.State.Running}}' |
    grep -q true; then
    echo "HeavyDB container exited before becoming ready" >&2
    docker logs "${container_name}" >&2 || true
    exit 1
  fi

  if curl --fail --silent --show-error \
    http://127.0.0.1:6273/ >/dev/null; then
    ready=true
    break
  fi
  sleep 2
done

if [[ "${ready}" != "true" ]]; then
  echo "HeavyDB did not become ready within 5 minutes" >&2
  docker logs "${container_name}" >&2 || true
  exit 1
fi

echo "HeavyDB is ready at http://127.0.0.1:6273"
