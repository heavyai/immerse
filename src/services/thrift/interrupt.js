// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import { BASE_FETCH_CONFIG } from "constants/services"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const {
  INTERRUPT_SESSION_QUERIES,
  INTERRUPT_SESSION_ON_CLOSE
} = available_feature_flags

export const thriftInterruptAsync = async (sessionID = "") =>
  await fetch(
    `${APP_CONFIG.url}/thrift/interrupt${
      sessionID ? `?session-id=${sessionID}` : ""
    }`,
    BASE_FETCH_CONFIG
  )

export const thriftInterrupt = (sessionID = "") => {
  ;(async () => {
    await thriftInterruptAsync(sessionID)
  })()
}

if (
  getFeatureFlag(INTERRUPT_SESSION_QUERIES) &&
  getFeatureFlag(INTERRUPT_SESSION_ON_CLOSE)
) {
  window.addEventListener("beforeunload", (e) => {
    thriftInterrupt()
    // the absence of a returnValue property on the event will guarantee the browser unload happens
    delete e.returnValue
  })
}
