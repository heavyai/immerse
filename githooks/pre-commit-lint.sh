#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

#
# This pre-commit will run eslint on any changed files and abort the commit if
# any of these linters return errors. This feature is opt-in and can be enabled
# with:
#   git config --type bool immerse.pre-commit.lint true
set -Eeuo pipefail

if [ "$(git config --type bool immerse.pre-commit.lint)" != "true" ]; then
  exit 0
fi

GITHOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
source "$GITHOOK_DIR/utils-changed-files.sh"
source "$GITHOOK_DIR/utils-colors.sh"
source "$GITHOOK_DIR/utils-error-logging.sh"
source "$GITHOOK_DIR/utils.sh"

# Determine what files we need to lint
declare -a FILES_TO_LINT=()
while read -rd '' filepath; do
  if [[ "$filepath" =~ \.[jt]sx?$ ]]; then
    FILES_TO_LINT+=("$filepath")
  fi
done < <(staged_changes)

# if there are no files to lint, quit early
if ((${#FILES_TO_LINT[@]} <= 0)); then
  exit 0
fi

# utility function to print out linting results - first argument is the name of
# the linter which will be used to print a header for the output. The rest of
# the arguments will be executed in a subshell. The function will "return" the
# exit code from the linter.
function run_linter {
  local linter="$1"
  local retval=0
  local output
  shift

  # this dance prevents the ERR trap from running
  # if the linter has a non-zero exit code
  set +E
  output="$("$@" 2>&1)" || retval=$?
  set -E

  if [ -n "$output" ]; then
    print_horizontal_bar
    echo "$RED$linter output:$RESET"
    echo "$output"
    echo
  fi

  return $retval
}

ABORT_COMMIT=0
if ! run_linter eslint npm run lint:cmd --silent -- --color "${FILES_TO_LINT[@]}"; then
  ABORT_COMMIT=1
fi

if [ $ABORT_COMMIT -ne 0 ]; then
  echo -e "${RED}Aborting commit due to the errors above.$RESET\n"
  exit 1
fi
