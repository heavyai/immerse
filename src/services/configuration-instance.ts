// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_POST,
  JSON_HEADERS
} from "../constants/services"

/**
 * This service handles getting and setting user-configurable settings that are
 * persisted on an instance level.
 * Use `setAndCacheConfigurationInstance` in refresh-action-creators instead of
 * this, otherwise the user who is modifying settings will also be prompted to refresh.
 */

export const setConfigurationInstance = async (
  configurationObj: {} // TODO: Define configuration object
) =>
  await fetch(`${APP_CONFIG.url}/configuration/instance`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(configurationObj)
    }
  })

export const getConfigurationInstance = async () =>
  await fetch(`${APP_CONFIG.url}/configuration/instance`, BASE_FETCH_CONFIG)
