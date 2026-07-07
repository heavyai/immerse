#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

#
# This file is meant to be sourced in a githook script. It adds a trap for
# errors that will print out a stack trace.
set -Eeuo pipefail

function error_report {
  local frame=0

  printf "=%.0s" $(seq 1 $(tput cols))
  echo -e "\n*** an error occurred in a githook script ***"
  echo -e "Please pass the following information on to Bob so he might fix it =)\n"
  while caller $frame; do
    ((frame++))
  done
  echo

  # We're going to exit with "success" so that the githook won't prevent
  # someone from getting work done.
  exit 0
}

trap error_report ERR
