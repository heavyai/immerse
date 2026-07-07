#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

#
# This file is meant to be sourced in a githook script to add color support. It
# provides some general utility functions.
set -Eeuo pipefail

function print_horizontal_bar {
  echo -n "$YELLOW"
  printf "=%.0s" $(seq 1 "$(tput cols)")
  echo "$RESET"
}
