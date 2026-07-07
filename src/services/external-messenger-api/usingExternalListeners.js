// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

export let usingExternalListeners = false

export function setUsingExternalListeners(newUsingExternalListeners) {
  usingExternalListeners = newUsingExternalListeners
}

let validOrigins = []

export function setValidOrigins(newValidOrigins) {
  validOrigins = newValidOrigins
}

export function isValidOrigin(origin) {
  return (
    !getFeatureFlag(available_feature_flags.EMBEDDED_API_SECURITY) ||
    validOrigins.includes(origin)
  )
}
