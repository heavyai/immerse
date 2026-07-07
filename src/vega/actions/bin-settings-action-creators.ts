// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as binSettingsConstants from "vega/constants/bin-settings-action-types"
import {
  BaseDimensionScaleSettings,
  BinnedTimeUnit,
  ExtractTimeUnit
} from "vega/charts/types"

// Do not call directly - call bin-settings-thunks#setChartBin
export const setChartBinDirect = (
  chartId: string,
  binSettings: BaseDimensionScaleSettings
) => ({
  type: binSettingsConstants.SET_CHART_BIN,
  chartId,
  binSettings
})

// Do not call directly - call bin-settings-thunks#clearChartbin
export const clearChartBinDirect = (chartId: string) => ({
  type: binSettingsConstants.CLEAR_CHART_BIN,
  chartId
})

export const setNumberOfBins = (chartId: string, numOfBins: number) => ({
  type: binSettingsConstants.SET_BINNING_NUMBER_OF_BINS,
  chartId,
  numOfBins
})

export const setBinningTimeUnit = (
  chartId: string,
  timeUnit: BinnedTimeUnit
) => ({
  type: binSettingsConstants.SET_BINNING_TIME_UNIT,
  chartId,
  timeUnit
})

export const setBinningExtractUnit = (
  chartId: string,
  timeUnit: ExtractTimeUnit
) => ({
  type: binSettingsConstants.SET_EXTRACT_TIME_UNIT,
  chartId,
  timeUnit
})

export const setBinningManualMin = (chartId: string, min: number) => ({
  type: binSettingsConstants.SET_BINNING_MANUAL_MIN,
  chartId,
  min
})

export const setBinningManualMax = (chartId: string, max: number) => ({
  type: binSettingsConstants.SET_BINNING_MANUAL_MAX,
  chartId,
  max
})

export const setBinningManualMinMax = (
  chartId: string,
  minmax: [number, number]
) => ({
  type: binSettingsConstants.SET_BINNING_MANUAL_MIN_MAX,
  chartId,
  minmax
})

export const clearBinningManualMin = (chartId: string) => ({
  type: binSettingsConstants.CLEAR_BINNING_MANUAL_MIN,
  chartId
})

export const clearBinningManualMax = (chartId: string) => ({
  type: binSettingsConstants.CLEAR_BINNING_MANUAL_MAX,
  chartId
})

export const setBaseDimensionFormat = (
  chartId: string,
  baseDimensionFormat: string
) => ({
  type: binSettingsConstants.SET_BASE_DIMENSION_FORMAT,
  chartId,
  baseDimensionFormat
})
