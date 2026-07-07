// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

export const useSharedSettingsEnabled = () => {
  return getFeatureFlag(available_feature_flags.ENABLE_SHARED_COLOR_SETTINGS)
}
