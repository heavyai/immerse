#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

: "${HEAVYDB_RESOURCE_SUFFIX:?HEAVYDB_RESOURCE_SUFFIX is required}"

resource_suffix="$(tr -cd '[:alnum:]_-' <<<"${HEAVYDB_RESOURCE_SUFFIX}")"
readonly container_name="immerse-puppeteer-heavydb-${resource_suffix}"
readonly image_name="immerse-puppeteer-heavydb:${resource_suffix}"
readonly volume_name="immerse-puppeteer-heavydb-${resource_suffix}"
readonly build_context="${RUNNER_TEMP:-/tmp}/immerse-heavydb-build-${resource_suffix}"

docker rm --force "${container_name}" 2>/dev/null || true
docker volume rm --force "${volume_name}" 2>/dev/null || true
docker image rm --force "${image_name}" 2>/dev/null || true
rm -rf "${build_context}"

if [[ -n "${HEAVYDB_PRODUCT_DIR:-}" ]]; then
  rm -rf "${HEAVYDB_PRODUCT_DIR}"
fi
