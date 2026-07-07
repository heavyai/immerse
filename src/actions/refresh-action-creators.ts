// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dispatch } from "redux"
import { cloneDeep, isEqual } from "lodash"
import {
  getConfigurationInstance,
  setConfigurationInstance
} from "../services/configuration-instance"
import { showRefreshModal } from "./ui-action-creators"

// eslint-disable-next-line init-declarations
let refreshListenerIntervalId: number | undefined
let lastSettings = ""

export const clearRefreshListener = () => {
  window.clearInterval(refreshListenerIntervalId)
}

// Setup polling for instance level settings updates so we can prompt users to refresh
const refreshListener = (dispatch: Dispatch) => async () => {
  const settingsResponse = await getConfigurationInstance()

  if (settingsResponse.ok) {
    const settings = await settingsResponse.json()
    const settingsChanged = !isEqual(lastSettings, settings)
    if (settingsChanged) {
      lastSettings = cloneDeep(settings)
      dispatch(showRefreshModal())
      // We do not re-prompt for refresh, so we can stop checking altogether
      clearRefreshListener()
    }
  }
}

export const initRefreshListener = () => async (dispatch: Dispatch) => {
  refreshListenerIntervalId = window.setInterval(
    refreshListener(dispatch),
    60000
  )
}

export const updateConfigInstanceCache = (configInstanceJSON: string) => {
  lastSettings = cloneDeep(configInstanceJSON)
}

export const setAndCacheConfigurationInstance = async (payload) => {
  const settingsResponse = await setConfigurationInstance(payload)

  if (settingsResponse.ok) {
    lastSettings = cloneDeep(payload)
  }

  return settingsResponse
}
