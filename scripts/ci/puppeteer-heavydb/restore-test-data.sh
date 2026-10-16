#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

: "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID is required}"
: "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY is required}"
: "${HEAVYDB_RESOURCE_SUFFIX:?HEAVYDB_RESOURCE_SUFFIX is required}"

resource_suffix="$(tr -cd '[:alnum:]_-' <<<"${HEAVYDB_RESOURCE_SUFFIX}")"
readonly container_name="immerse-puppeteer-heavydb-${resource_suffix}"
script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly script_directory
readonly sql_template="${script_directory}/restore-test-data.sql.template"
readonly heavyiq_sql_template="${script_directory}/restore-heavyiq-test-data.sql.template"

for template in "${sql_template}" "${heavyiq_sql_template}"; do
  if [[ ! -f "${template}" ]]; then
    echo "Restore SQL template not found at ${template}" >&2
    exit 1
  fi
done

heavy_sql=(
  docker exec --interactive "${container_name}"
  /opt/heavyai/bin/heavysql
  --quiet
  --user admin
  --passwd HyperInteractive
)
heavyai_sql=("${heavy_sql[@]}" --db heavyai)
heavyiq_sql=("${heavy_sql[@]}" --db heavyiq)

ready=false
for _ in $(seq 1 60); do
  if printf 'SELECT 1;\n' | "${heavyai_sql[@]}" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done

if [[ "${ready}" != "true" ]]; then
  echo "HeavyDB did not accept SQL connections within 2 minutes" >&2
  exit 1
fi

restore_sql="$(mktemp)"
heavyiq_restore_sql="$(mktemp)"
trap 'rm -f "${restore_sql}" "${heavyiq_restore_sql}"' EXIT
chmod 600 "${restore_sql}" "${heavyiq_restore_sql}"

render_restore_sql() {
  SQL_TEMPLATE="$1" RESTORE_SQL="$2" node <<'NODE'
const fs = require("fs")

const escapeSqlLiteral = (value) => value.replaceAll("'", "''")
const substitutions = {
  __AWS_ACCESS_KEY_ID__: escapeSqlLiteral(process.env.AWS_ACCESS_KEY_ID),
  __AWS_SECRET_ACCESS_KEY__: escapeSqlLiteral(process.env.AWS_SECRET_ACCESS_KEY)
}

let sql = fs.readFileSync(process.env.SQL_TEMPLATE, "utf8")
for (const [placeholder, value] of Object.entries(substitutions)) {
  sql = sql.replaceAll(placeholder, value)
}

fs.writeFileSync(process.env.RESTORE_SQL, sql, { mode: 0o600 })
NODE
}

render_restore_sql "${sql_template}" "${restore_sql}"
render_restore_sql "${heavyiq_sql_template}" "${heavyiq_restore_sql}"

echo "Restoring browser-test datasets into heavyai from S3"
"${heavyai_sql[@]}" <"${restore_sql}"

printf "CREATE DATABASE IF NOT EXISTS heavyiq (owner = 'admin');\n" |
  "${heavyai_sql[@]}"

echo "Restoring browser-test datasets into heavyiq from S3"
"${heavyiq_sql[@]}" <"${heavyiq_restore_sql}"

echo "Validating restored heavyai table schemas"
"${heavyai_sql[@]}" <<'SQL'
SELECT
  carrier_name,
  uniquecarrier,
  dest,
  dest_city,
  dest_state,
  dest_lon,
  dest_lat,
  origin_lon,
  origin_lat,
  airtime,
  distance,
  carrierdelay,
  securitydelay,
  taxiout,
  taxiin,
  flight_month,
  flightnum,
  arrtime
FROM flights_donotmodify
LIMIT 1;

SELECT
  lon,
  lat,
  followees,
  country,
  followers,
  state_abbr,
  join_time,
  lang,
  tweet_count,
  county_state,
  admin1
FROM tweets_nov_feb
LIMIT 1;

SELECT country, COUNT(country) AS row_count
FROM tweets_nov_feb
WHERE country IS NOT NULL
GROUP BY country
ORDER BY row_count DESC
LIMIT 51;

SELECT NAME, ALAND, AWATER, geom, STUSPS
FROM us_states_geo
LIMIT 1;

SELECT NAME, geom
FROM Historical_Hurricanes_Tracks_1842_2021
LIMIT 1;
SQL

echo "Validating restored heavyiq table schemas"
"${heavyiq_sql[@]}" <<'SQL'
SELECT
  DAM_LEN_M,
  DAM_HGT_M,
  DAM_NAME,
  DEPTH_M,
  geom,
  RIVER,
  RES_NAME,
  QUALITY,
  NEAR_CITY,
  MAIN_BASIN
FROM world_dams
LIMIT 1;
SQL

echo "Browser-test datasets restored and validated"
