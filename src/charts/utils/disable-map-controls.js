// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

export const circleFeatureIsDisabled = () => {
  return getFeatureFlag(available_feature_flags.DISABLE_CIRCLE)
}

export const lassoFeatureIsDisabled = () => {
  return getFeatureFlag(available_feature_flags.DISABLE_LASSO)
}

export const polylineFeatureIsDisabled = () => {
  return getFeatureFlag(available_feature_flags.DISABLE_POLYLINE)
}
