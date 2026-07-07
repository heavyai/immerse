// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generatePath, useParams } from "react-router"
import { ROUTE_SETTINGS } from "routes/paths"

type SettingsPathParams = {
  database?: string
  settingsSection?: string
}

export const useSettingsPath = (params: SettingsPathParams) => {
  const currentDatabase = useParams<SettingsPathParams>().database

  return generatePath(ROUTE_SETTINGS, {
    database: params.database || currentDatabase,
    settingsSection: params.settingsSection
  })
}
