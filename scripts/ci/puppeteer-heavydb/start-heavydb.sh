#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

: "${HEAVYDB_TARBALL:?HEAVYDB_TARBALL is required}"
: "${HEAVYDB_RESOURCE_SUFFIX:?HEAVYDB_RESOURCE_SUFFIX is required}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
resource_suffix="$(tr -cd '[:alnum:]_-' <<<"${HEAVYDB_RESOURCE_SUFFIX}")"
readonly container_name="immerse-puppeteer-heavydb-${resource_suffix}"
readonly image_name="immerse-puppeteer-heavydb:${resource_suffix}"
readonly volume_name="immerse-puppeteer-heavydb-${resource_suffix}"
readonly build_context="${RUNNER_TEMP:-/tmp}/immerse-heavydb-build-${resource_suffix}"

rm -rf "${build_context}"
mkdir -p "${build_context}"
cp "${HEAVYDB_TARBALL}" "${build_context}/product.tar.gz"
cp "${script_dir}/Dockerfile" "${script_dir}/entrypoint.sh" "${build_context}/"

docker build --tag "${image_name}" "${build_context}"
docker volume create "${volume_name}" >/dev/null
docker run --detach \
  --name "${container_name}" \
  --volume "${volume_name}:/var/lib/heavyai" \
  --publish 127.0.0.1:6273:6273 \
  --publish 127.0.0.1:6274:6274 \
  --publish 127.0.0.1:6278:6278 \
  --publish 127.0.0.1:6279:6279 \
  "${image_name}" >/dev/null

ready=false
for _ in $(seq 1 90); do
  if ! docker inspect "${container_name}" --format '{{.State.Running}}' | grep -q true; then
    echo "HeavyDB container exited before becoming ready" >&2
    docker logs "${container_name}" >&2 || true
    exit 1
  fi

  if docker exec "${container_name}" bash -c \
    "printf 'SELECT 1;\\n' | /opt/heavyai/bin/heavysql heavyai -u admin -p HyperInteractive >/dev/null" &&
    curl --fail --silent --show-error http://127.0.0.1:6273/ >/dev/null; then
    ready=true
    break
  fi
  sleep 2
done

if [[ "${ready}" != "true" ]]; then
  echo "HeavyDB did not become ready within 180 seconds" >&2
  docker logs "${container_name}" >&2 || true
  exit 1
fi

rm -rf "${build_context}"
echo "Disposable HeavyDB is ready at http://127.0.0.1:6273"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "container=${container_name}"
    echo "image=${image_name}"
    echo "volume=${volume_name}"
  } >>"${GITHUB_OUTPUT}"
fi
