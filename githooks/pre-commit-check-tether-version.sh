#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

#
# This githook will check if the version of tether in package-lock.json is
# 1.4.4 or less. If the check fails, an error message will print with
# directions for fixing the issue, and the commit will abort.
set -Eeuo pipefail


MAX_TETHER_VERSION=1.4.4


# -----------------------------------------------------------------------------
GITHOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
source "$GITHOOK_DIR/utils-colors.sh"
source "$GITHOOK_DIR/utils-error-logging.sh"

# Function for comparing version strings. Will return true if the version
# string in the first parameter is greater than all other version string
# parameters.
function version_gt() {
  test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

# Make sure the version of tether in package-lock.json is less than or equal to
# MAX_TETHER_VERSION.
while read -r line; do
  if [[ "$line" =~ ([0-9]+(\.[0-9]+){2}) ]]; then
    TETHER_VERSION=${BASH_REMATCH[1]}
    if version_gt "$TETHER_VERSION" "$MAX_TETHER_VERSION"; then
      cat <<EOF
${RED}ERROR: Your package-lock.json specifies tether v${TETHER_VERSION}. The
version of tether must not exceed v${MAX_TETHER_VERSION}!${RESET}

To fix:
  rm -r node_modules
  npx npm-force-resolutions
  npm install
EOF
      exit 1
    fi
  fi
done < <(git show :package-lock.json | grep -E '"resolved":.*/tether/')
