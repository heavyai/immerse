// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as timeLagSettingsConstants from "vega/constants/time-lag-settings-action-types"

import { TimeLagSettings } from "vega/charts/types"
import { TimeLagMode } from "vega/constants/data-selection-types"

export const setChartTimeLagDirect = (
  chartId: string,
  timeLagSettings: TimeLagSettings
) => ({
  type: timeLagSettingsConstants.SET_CHART_TIME_LAG,
  chartId,
  timeLagSettings
})

export const clearChartTimeLagDirect = (chartId: string) => ({
  type: timeLagSettingsConstants.CLEAR_CHART_TIME_LAG,
  chartId
})

export const linkBaseMeasureToTimeLag = (
  chartId: string,
  layerId: string,
  measureIndex: number,
  timeLagId: string
) => ({
  type: timeLagSettingsConstants.LINK_BASE_MEASURE_TIME_LAG,
  chartId,
  layerId,
  measureIndex,
  timeLagId
})

export const unlinkBaseMeasureToTimeLag = (
  chartId: string,
  layerId: string,
  measureIndex: number
) => ({
  type: timeLagSettingsConstants.UNLINK_BASE_MEASURE_TIME_LAG,
  chartId,
  layerId,
  measureIndex
})

export const setChartTimeLagInterval = (
  chartId: string,
  label: string,
  interval: string
) => ({
  type: timeLagSettingsConstants.SET_TIME_LAG_INTERVAL,
  chartId,
  label,
  interval
})

export const setTimeLagMeasureMode = (
  chartId: string,
  layerId: string,
  timeLagMeasureId: string,
  mode: TimeLagMode
) => ({
  type: timeLagSettingsConstants.SET_TIME_LAG_MEASURE_MODE,
  chartId,
  layerId,
  timeLagMeasureId,
  mode
})
