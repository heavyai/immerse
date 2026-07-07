// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_POST,
  JSON_HEADERS
} from "../constants/services"
import { UserConfig } from "components/ui-config-panel/types"

/**
 * This service handles getting and setting user-configurable settings that are
 * persisted on a database level, such as the settings in the ui-config panel
 */

export const setConfigurationDB = async (configurationObj: UserConfig | {}) =>
  await fetch(`${APP_CONFIG.url}/configuration/db`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(configurationObj)
    }
  })

export const getConfigurationDB = async () =>
  await fetch(`${APP_CONFIG.url}/configuration/db`, BASE_FETCH_CONFIG)
