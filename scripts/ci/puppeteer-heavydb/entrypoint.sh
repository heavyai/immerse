#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

readonly data_dir="${HEAVYDB_DATA_DIR:-/var/lib/heavyai/storage}"
readonly console_log_dir="/var/lib/heavyai/ci-logs"

mkdir -p "${console_log_dir}"
if [[ ! -d "${data_dir}/mapd_catalogs" ]]; then
  mkdir -p "${data_dir}"
  /opt/heavyai/bin/initheavy -f --data "${data_dir}"
fi

children=()
stop_services() {
  trap - SIGINT SIGTERM EXIT
  if ((${#children[@]})); then
    kill "${children[@]}" 2>/dev/null || true
    wait "${children[@]}" 2>/dev/null || true
  fi
}
trap stop_services SIGINT SIGTERM EXIT

/opt/heavyai/bin/heavydb "${data_dir}" \
  --cpu-only \
  --port 6274 \
  --http-port 6278 \
  --calcite-port 6279 \
  >"${console_log_dir}/heavydb-console.log" 2>&1 &
children+=("$!")
echo "HeavyDB started as PID ${children[-1]}"

/opt/heavyai/bin/heavy_web_server \
  --port 6273 \
  --backend-url http://127.0.0.1:6278 \
  --data "${data_dir}" \
  >"${console_log_dir}/heavy-web-server-console.log" 2>&1 &
children+=("$!")
echo "Heavy web server started as PID ${children[-1]}"

set +e
wait -n "${children[@]}"
status=$?
set -e

echo "A HeavyDB service exited with status ${status}" >&2
for log_file in "${console_log_dir}"/*.log; do
  echo "===== ${log_file} =====" >&2
  cat "${log_file}" >&2
done
exit "${status}"
