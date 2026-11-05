#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -ex

export NODE_ENV=production
export BABEL_ENV=production
export NODE_OPTIONS=--max_old_space_size=4096
export LINK_OVERRIDE_CSS=override
# Uncomment to enable Heavy Eco
# export HEAVY_ECO=true

pnpm run clean
pnpm run copyServersJson
pnpm run copyFavicon
pnpm run copyGeoJson
pnpm run copyFonts
pnpm run copySamlErrorPage
pnpm run webpack --bail --config webpack.config.prod.ts

if [ "${PIPESTATUS[0]}" != "0" ]; then exit 1; fi

# Remove sourcemaps
rm -f dist/*\.js\.map
rm -f dist/*\.css\.map

if [ -f dist/*\.js\.map ]; then
  echo "Source maps detected! Failing build."
  exit 1
fi
