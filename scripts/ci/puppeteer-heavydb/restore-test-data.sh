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

if [[ ! -f "${sql_template}" ]]; then
  echo "Restore SQL template not found at ${sql_template}" >&2
  exit 1
fi

heavy_sql=(
  docker exec --interactive "${container_name}"
  /opt/heavyai/bin/heavysql
  --quiet
  --user admin
  --passwd HyperInteractive
  --db heavyai
)

ready=false
for _ in $(seq 1 60); do
  if printf 'SELECT 1;\n' | "${heavy_sql[@]}" >/dev/null 2>&1; then
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
trap 'rm -f "${restore_sql}"' EXIT
chmod 600 "${restore_sql}"

SQL_TEMPLATE="${sql_template}" RESTORE_SQL="${restore_sql}" node <<'NODE'
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

echo "Restoring Puppeteer datasets from S3"
"${heavy_sql[@]}" <"${restore_sql}"

echo "Validating restored table schemas"
"${heavy_sql[@]}" <<'SQL'
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

SELECT flightnum, uniquecarrier, COUNT(*) AS row_count
FROM flights_donotmodify
WHERE flightnum = 7720
GROUP BY flightnum, uniquecarrier
ORDER BY row_count DESC;

SELECT
  flightnum,
  MIN(uniquecarrier) AS uniquecarrier,
  COUNT(DISTINCT uniquecarrier) AS carrier_count,
  COUNT(*) AS row_count
FROM flights_donotmodify
WHERE flightnum IS NOT NULL AND uniquecarrier IS NOT NULL
GROUP BY flightnum
HAVING COUNT(DISTINCT uniquecarrier) = 1
ORDER BY row_count DESC, flightnum
LIMIT 20;

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
SQL

echo "Puppeteer datasets restored and validated"
