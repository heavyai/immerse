// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// window.MAP_CONFIG is injected server-side (see heavyai/webserver's
// handlers/app_index.go) from the mapbox-token/google-api-key entries
// in heavy.conf's [web] section. process.env fallback keeps local
// `npm start` working via the .env file (see webpack.config.dev.ts's
// Dotenv plugin).
const runtimeMapConfig = window.MAP_CONFIG || {}

export const MAPBOX_TOKEN =
  runtimeMapConfig.mapboxToken || process.env.MAPBOX_TOKEN

export const GOOGLE_API_KEY =
  runtimeMapConfig.googleApiKey || process.env.GOOGLE_API_KEY
