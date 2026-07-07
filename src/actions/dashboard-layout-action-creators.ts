// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ADD_CHART,
  UPDATE_LAYOUT,
  UPDATE_LAYOUT_FOR_CHART
} from "constants/action-types"

export type Layout = {
  w: number
  h: number
  x: number
  y: number
  i: string
  moved: boolean
  static: boolean
}

export function addChart(id) {
  return {
    type: ADD_CHART,
    payload: { id }
  }
}

export function updateLayout(layout: any[]) {
  return {
    type: UPDATE_LAYOUT,
    payload: { layout }
  }
}

export function updateLayoutForChart(chartId: number, layout: Layout) {
  return {
    type: UPDATE_LAYOUT_FOR_CHART,
    chartId,
    layout
  }
}
