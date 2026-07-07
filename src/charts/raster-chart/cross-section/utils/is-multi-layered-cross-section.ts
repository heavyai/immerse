// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartState } from "./charts-reducer-types"
import { CHART_TYPES } from "constants/charts"

export const isMultiLayeredCrossSection = (chart: ChartState) => {
  const layerTypes = chart?.layers?.map((l) => l?.type)
  if (!layerTypes) {
    return false
  }
  return (
    layerTypes.includes(CHART_TYPES.CROSS_SECTION) &&
    layerTypes.includes(CHART_TYPES.CROSS_SECTION_TERRAIN)
  )
}
