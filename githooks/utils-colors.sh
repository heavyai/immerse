#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

#
# This file is meant to be sourced in a githook script to add color support. To
# use the colors, simply include the variables in your output. Don't forget to
# use $RESET at the end to put the user's terminal back the way they want it!
set -Eeuo pipefail

BOLD=
UNDERLINE=
STANDOUT=
BLACK=
RED=
GREEN=
YELLOW=
BLUE=
MAGENTA=
CYAN=
WHITE=
RESET=
if [ -t 1 ]; then
  NCOLORS=$(tput colors)
  if [ -n "$NCOLORS" ] && [ $NCOLORS -ge 8 ]; then
    BOLD=$(tput bold)
    UNDERLINE=$(tput smul)
    STANDOUT=$(tput smso)
    BLACK=$(tput setaf 0)
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    MAGENTA=$(tput setaf 5)
    CYAN=$(tput setaf 6)
    WHITE=$(tput setaf 7)
    RESET=$(tput sgr0)
  fi
fi
