// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

// For use in utilities
export const isCrossSectionTerrainEnabled = () =>
  getFeatureFlag(available_feature_flags.ENABLE_CROSS_SECTION_TERRAIN_CHART)

// Same for use in components
export const useCrossSectionTerrainEnabled = () =>
  isCrossSectionTerrainEnabled()
