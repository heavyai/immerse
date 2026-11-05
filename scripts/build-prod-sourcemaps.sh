#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -ex

export NODE_ENV=production
export BABEL_ENV=production
export NODE_OPTIONS=--max_old_space_size=4096

pnpm run clean
pnpm run copyServersJson
pnpm run copyFavicon
pnpm run copyGeoJson
pnpm run copyFonts
pnpm run copySamlErrorPage
pnpm run webpack --bail --config webpack.config.prod.ts

if [ "${PIPESTATUS[0]}" != "0" ]; then exit 1; fi
