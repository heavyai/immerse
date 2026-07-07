#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

#
# This file is meant to be sourced in a githook script. It provides a function
# which will return a list of paths to staged files that have changed relative
# to the given commit.
#
# The correct way to use this function is with read -rd '' such as:
#   while read -rd '' filepath; do
#     # do something with $filepath here
#   done < <(staged_changes origin/master)
#
#   -or-
#
#   staged_changes origin/master | while read -rd '' filepath; do
#     # do something with $filepath
#   done
set -Eeuo pipefail

function staged_changes {
  git diff --cached --name-only --diff-filter=ACM -z "${1-HEAD}"
}
