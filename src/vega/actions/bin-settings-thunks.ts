// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  VegaComboChart,
  BinnedTimeUnit,
  ExtractTimeUnit,
  BaseDimensionScaleSettings
} from "vega/charts/types"
import {
  createTimeScaleSettings,
  createNumericScaleSettings,
  createExtractScaleSettings
} from "vega/utils/binning"

import {
  setBinningTimeUnit,
  setBinningExtractUnit,
  setChartBinDirect,
  clearChartBinDirect
} from "./bin-settings-action-creators"
import { setBaseDimensionSortOptions } from "./data-selection-action-creators"

export const setChartBin = (
  chartId: string,
  binSettings: BaseDimensionScaleSettings
) => async (dispatch, getState) => {
  const chart = getState().charts[chartId] as VegaComboChart

  // If we're changing to a different type of binSettings, reset the sort column
  // to the dimension
  if (binSettings.dimensionType !== chart.binSettings?.dimensionType) {
    await Promise.all([
      dispatch(
        setBaseDimensionSortOptions(chartId, {
          col: { name: "dimension0" },
          index: 0,
          order: "asc"
        })
      ),
      dispatch(setChartBinDirect(chartId, binSettings))
    ])
  } else {
    await dispatch(setChartBinDirect(chartId, binSettings))
  }
}

export const clearChartBin = (chartId: string) => async (
  dispatch,
  getState
) => {
  const chart = getState().charts[chartId] as VegaComboChart

  // If we're actually clearing binSettings, reset the sort column to # records
  if (chart.binSettings) {
    await Promise.all([
      dispatch(
        setBaseDimensionSortOptions(chartId, {
          col: { name: "countval" },
          index: 0,
          order: "desc"
        })
      ),
      dispatch(clearChartBinDirect(chartId))
    ])
  } else {
    await dispatch(clearChartBinDirect(chartId))
  }
}

export const setTimeBinningWithUnit = (
  chartId: string,
  timeUnit: BinnedTimeUnit
) => async (dispatch, getState) => {
  const { charts } = getState()
  const chart = charts[chartId] as VegaComboChart

  if (chart.binSettings?.dimensionType === "binned_time") {
    await dispatch(setBinningTimeUnit(chartId, timeUnit))
  } else {
    await dispatch(setChartBin(chartId, createTimeScaleSettings(timeUnit)))
  }
}

export const setExtractBinningWithUnit = (
  chartId: string,
  timeUnit: ExtractTimeUnit
) => async (dispatch, getState) => {
  const { charts } = getState()
  const chart = charts[chartId] as VegaComboChart

  if (chart.binSettings?.dimensionType === "extract_time") {
    await dispatch(setBinningExtractUnit(chartId, timeUnit))
  } else {
    await dispatch(setChartBin(chartId, createExtractScaleSettings(timeUnit)))
  }
}

export const resetChartBinToDefault = (chartId: string) => async (
  dispatch,
  getState
) => {
  const { charts } = getState()
  const chart = charts[chartId] as VegaComboChart

  if (chart.binSettings?.dimensionType === "binned_time") {
    await dispatch(setChartBin(chartId, createTimeScaleSettings()))
  } else if (chart.binSettings?.dimensionType === "binned_numeric") {
    await dispatch(setChartBin(chartId, createNumericScaleSettings()))
  }
}
