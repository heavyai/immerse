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

npm run clean
npm run copyServersJson
npm run copyFavicon
npm run copyGeoJson
npm run copyFonts
npm run copySamlErrorPage
npm run webpack -- --bail --config webpack.config.prod.ts

if [ "${PIPESTATUS[0]}" != "0" ]; then exit 1; fi

# Remove sourcemaps
rm -f dist/*\.js\.map
rm -f dist/*\.css\.map

if [ -f dist/*\.js\.map ]; then
  echo "Source maps detected! Failing build."
  exit 1
fi
