// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as markSettingsConstants from "vega/constants/mark-settings-action-types"
import { MarkSettings } from "vega/constants/data-selection-types"

export const setMeasureMarkType = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  markType: NonNullable<MarkSettings["markType"]>
) => ({
  type: markSettingsConstants.SET_MEASURE_MARK_TYPE,
  chartId,
  layerId,
  measureIndex,
  markType
})

export const setMeasureLineStyle = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  lineStyle: NonNullable<MarkSettings["lineStyle"]>
) => ({
  type: markSettingsConstants.SET_MEASURE_LINE_STYLE,
  chartId,
  layerId,
  measureIndex,
  lineStyle
})

export const setMeasureAxis = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  axis: NonNullable<MarkSettings["axis"]>
) => ({
  type: markSettingsConstants.SET_MEASURE_AXIS,
  chartId,
  layerId,
  measureIndex,
  axis
})

// Actions below unused for now

/**
 * If hideLine is explicitly given a value, hideLine will be set to that value.
 * Otherwise, if hideLine is unset, the hideLine property will toggle.
 */
export const toggleMeasureHideLine = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  hideLine?: boolean
) => ({
  type: markSettingsConstants.TOGGLE_MEASURE_HIDE_LINE,
  chartId,
  layerId,
  measureIndex,
  hideLine
})

export const setMeasureLineThickness = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  lineThickness: number
) => ({
  type: markSettingsConstants.SET_MEASURE_LINE_THICKNESS,
  chartId,
  layerId,
  measureIndex,
  lineThickness
})

export const setMeasureLineShadow = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  lineShadow: number
) => ({
  type: markSettingsConstants.SET_MEASURE_LINE_SHADOW,
  chartId,
  layerId,
  measureIndex,
  lineShadow
})

export const setMeasureMarkColor = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  markColor: string
) => ({
  type: markSettingsConstants.SET_MEASURE_MARK_COLOR,
  chartId,
  layerId,
  measureIndex,
  markColor
})
