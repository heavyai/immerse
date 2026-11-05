#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -ex

export NODE_ENV=production
export BABEL_ENV=production
export NODE_OPTIONS=--max_old_space_size=4096
export ENABLE_CONTROL_PANEL=true

pnpm run clean
pnpm run mkDistDir
LOCAL_SERVERS_JSON=./src/servers.local.json
if [ -f "$LOCAL_SERVERS_JSON" ]; then
  echo "Copying ./src/servers.local.json => ./dist/servers.json"
  pnpm run copyServersLocalJson
else
  echo "Copying ./src/servers.json => ./dist/servers.json"
  pnpm run copyServersJson
fi
pnpm run copyAppConfigJs
pnpm run copyFavicon
pnpm run copyGeoJson
pnpm run copyFonts
pnpm run copySamlErrorPage
pnpm run webpack --config webpack.config.dev.ts --bail

if [ "${PIPESTATUS[0]}" != "0" ]; then exit 1; fi
