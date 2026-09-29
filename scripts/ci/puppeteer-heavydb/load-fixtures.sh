#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

: "${HEAVYDB_RESOURCE_SUFFIX:?HEAVYDB_RESOURCE_SUFFIX is required}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repository_root="$(cd "${script_dir}/../../.." && pwd)"
resource_suffix="$(tr -cd '[:alnum:]_-' <<<"${HEAVYDB_RESOURCE_SUFFIX}")"
readonly container_name="immerse-puppeteer-heavydb-${resource_suffix}"
readonly generated_dir="${RUNNER_TEMP:-/tmp}/immerse-heavydb-fixtures-${resource_suffix}"
readonly container_fixture_dir="/var/lib/heavyai/storage/import/immerse-ci"
readonly heavysql="/opt/heavyai/bin/heavysql heavyai -u admin -p HyperInteractive"

rm -rf "${generated_dir}"
node \
  "${repository_root}/src/ui-tests/fixtures/heavydb/generate-fixtures.js" \
  "${generated_dir}"

docker exec "${container_name}" mkdir -p "${container_fixture_dir}"
docker cp "${generated_dir}/." "${container_name}:${container_fixture_dir}"
docker exec -i "${container_name}" bash -c "${heavysql}" < \
  "${repository_root}/src/ui-tests/fixtures/heavydb/schema.sql"

validation="$(
  docker exec "${container_name}" bash -c "${heavysql}" <<'SQL'
SELECT CASE WHEN
  (SELECT COUNT(*) FROM flights_donotmodify) = 1200
  AND (SELECT COUNT(*) FROM flights_donotmodify WHERE flight_month = 100) = 0
  AND (SELECT COUNT(*) FROM flights_donotmodify WHERE flight_month IN (5, 12)) > 0
  AND (SELECT COUNT(DISTINCT country) FROM tweets_nov_feb) = 51
  AND (SELECT COUNT(*) FROM us_states_geo) = 5
THEN 'PASS' ELSE 'FAIL' END AS fixture_status;
SQL
)"
echo "${validation}"
if [[ "${validation}" != *PASS* ]]; then
  echo "HeavyDB fixture validation failed" >&2
  exit 1
fi

rm -rf "${generated_dir}"
