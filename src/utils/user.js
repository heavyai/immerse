// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import { IMMERSE_EXPORT_DISABLED_ROLE } from "constants/roles"

const { USER_EXPORT_DISABLED } = available_feature_flags

export function isUserExportDisabled(roles) {
  const userExportDisabledFeatureFlag = getFeatureFlag(USER_EXPORT_DISABLED)
  return (
    userExportDisabledFeatureFlag &&
    roles.includes(IMMERSE_EXPORT_DISABLED_ROLE)
  )
}
