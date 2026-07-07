// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as legendConstants from "../constants/legend-action-types"

/**
 * Toggle legend pinning in dashboard view.
 * @param chartId The chart ID
 * @param pinned color legend pinned state for the chart
 */
export const toggleLegendPinning = (chartId: string, pinned: boolean) => ({
  type: legendConstants.TOGGLE_LEGEND_PINNING,
  chartId,
  pinned
})

export const toggleLegendCollapsed = (
  chartId: string,
  layerId: string,
  collapsed: boolean
) => ({
  type: legendConstants.TOGGLE_LEGEND_COLLAPSED,
  chartId,
  layerId,
  collapsed
})
