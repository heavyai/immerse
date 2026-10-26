#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

: "${HEAVYDB_IMAGE:=docker.io/heavyai/scantest:ubuntu22.04-cuda-render-x86_64-10.1.0dev-20261014-bae68469da}"
: "${HEAVYDB_RESOURCE_SUFFIX:?HEAVYDB_RESOURCE_SUFFIX is required}"
: "${IMMERSE_DIST_DIR:=${GITHUB_WORKSPACE:-$(pwd)}/dist}"

resource_suffix="$(tr -cd '[:alnum:]_-' <<<"${HEAVYDB_RESOURCE_SUFFIX}")"
readonly container_name="immerse-puppeteer-heavydb-${resource_suffix}"

if [[ ! -f "${IMMERSE_DIST_DIR}/index.html" ]]; then
  echo "Immerse build not found at ${IMMERSE_DIST_DIR}" >&2
  exit 1
fi

immerse_dist_dir="$(cd "${IMMERSE_DIST_DIR}" && pwd)"
readonly immerse_dist_dir

docker pull "${HEAVYDB_IMAGE}"
docker rm --force "${container_name}" 2>/dev/null || true

docker_args=(
  --detach
  --name "${container_name}"
  --gpus all
  --ipc host
  --publish 127.0.0.1:6273:6273
  --publish 127.0.0.1:6274:6274
  --publish 127.0.0.1:6278:6278
  --publish 127.0.0.1:6279:6279
  --volume "${immerse_dist_dir}:/opt/heavyai/frontend:ro"
)

docker run \
  "${docker_args[@]}" \
  "${HEAVYDB_IMAGE}" >/dev/null

ready=false
for _ in $(seq 1 150); do
  if ! docker inspect "${container_name}" --format '{{.State.Running}}' |
    grep -q true; then
    echo "HeavyDB container exited before becoming ready" >&2
    docker logs "${container_name}" >&2 || true
    exit 1
  fi

  if curl --fail --silent --show-error http://127.0.0.1:6273/ |
    grep --quiet '<div id="root"></div>'; then
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

echo "HeavyDB is serving the mounted Immerse build at http://127.0.0.1:6273"
