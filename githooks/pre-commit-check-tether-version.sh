#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail
# Check the staged resolution, rather than an obsolete npm lock or a mutable
# installation. The legacy tooltip requires tether <=1.4.4.
git show :pnpm-lock.yaml | node -e '
const fs = require("fs")
const yaml = require("yaml")
const lock = yaml.parse(fs.readFileSync(0, "utf8"))
for (const key of Object.keys(lock.packages || {})) {
  const match = key.match(/^tether@(\d+)\.(\d+)\.(\d+)/)
  if (match && (Number(match[1]) > 1 || Number(match[1]) === 1 && (Number(match[2]) > 4 || Number(match[2]) === 4 && Number(match[3]) > 4))) {
    throw new Error("tether must remain <=1.4.4; review the workspace override and regenerate pnpm-lock.yaml")
  }
}
'
