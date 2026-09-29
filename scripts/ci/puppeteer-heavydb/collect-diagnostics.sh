#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

: "${HEAVYDB_RESOURCE_SUFFIX:?HEAVYDB_RESOURCE_SUFFIX is required}"
: "${HEAVYDB_DIAGNOSTICS_DIR:?HEAVYDB_DIAGNOSTICS_DIR is required}"

resource_suffix="$(tr -cd '[:alnum:]_-' <<<"${HEAVYDB_RESOURCE_SUFFIX}")"
readonly container_name="immerse-puppeteer-heavydb-${resource_suffix}"

mkdir -p "${HEAVYDB_DIAGNOSTICS_DIR}"
if ! docker inspect "${container_name}" >"${HEAVYDB_DIAGNOSTICS_DIR}/container-inspect.json" 2>&1; then
  echo "Container ${container_name} does not exist; no HeavyDB diagnostics to collect"
  exit 0
fi

docker logs "${container_name}" >"${HEAVYDB_DIAGNOSTICS_DIR}/container.log" 2>&1 || true
docker cp \
  "${container_name}:/var/lib/heavyai/ci-logs" \
  "${HEAVYDB_DIAGNOSTICS_DIR}/ci-logs" 2>/dev/null || true
docker cp \
  "${container_name}:/var/lib/heavyai/storage/log" \
  "${HEAVYDB_DIAGNOSTICS_DIR}/heavydb-logs" 2>/dev/null || true
