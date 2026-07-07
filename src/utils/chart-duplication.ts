// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppState } from "vega/charts/types"

/**
 * Used when duplicating a chart. Makes it so it keeps the height
 * and width of the original chart
 *
 * Gets a new copy of state.dashboard.layout that sets the newly-migrated
 * chart's height and width properties to equal that of the source chart
 *
 * @param {*} layout - state.dashboard.layout (should include new chart)
 * @param {*} sourceChartId - chart ID of the original chart
 * @param {*} newChartId - chart ID of the new chart
 */
export const getLayoutWithDuplicatedChart = (
  layout: AppState["dashboard"]["layout"],
  sourceChartId: string,
  newChartId: string
) => {
  const sourceChartLayout = layout.find(
    (layoutObject) => layoutObject.i === sourceChartId
  )
  const newChartLayoutIndex = layout.findIndex(
    (layoutObject) => layoutObject.i === newChartId
  )
  if (sourceChartLayout && newChartLayoutIndex !== undefined) {
    const newLayout = layout.map((l, i) => {
      if (i === newChartLayoutIndex) {
        return {
          ...l,
          w: sourceChartLayout.w,
          h: sourceChartLayout.h
        }
      }
      return l
    })
    return newLayout
  }
  return layout
}
