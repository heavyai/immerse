#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -ex

export NODE_ENV=production
export BABEL_ENV=production
export NODE_OPTIONS=--max_old_space_size=4096

npm run clean
npm run copyServersJson
npm run copyFavicon
npm run copyGeoJson
npm run copyFonts
npm run copySamlErrorPage
npm run webpack -- --bail --config webpack.config.prod.ts

if [ "${PIPESTATUS[0]}" != "0" ]; then exit 1; fi
