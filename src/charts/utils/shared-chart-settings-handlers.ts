// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"
import * as Line2Actions from "charts/combo/line-chart2/line2-action-creators"
import * as LineChartActions from "charts/line/line-chart-action-creators"
import * as ChartsActions from "actions/charts-action-creators"

export const useOnValueChangeWithCap = (id, updateChart) => {
  return useCallback(
    (value) => {
      updateChart(id, { cap: value })
    },
    [id, updateChart]
  )
}

export const useOnValueChangeWithShowNulls = (
  id,
  updateChart,
  showNullDimensions
) => {
  return useCallback(() => {
    const currentValue = showNullDimensions
    updateChart(id, { showNullDimensions: !currentValue })
  }, [id, updateChart, showNullDimensions])
}

export const useOnValueChangeWithShowNullMeasures = (
  id,
  updateChart,
  showNullMeasures
) => {
  return useCallback(() => {
    const currentValue = showNullMeasures
    updateChart(id, { showNullMeasures: !currentValue })
  }, [id, updateChart, showNullMeasures])
}

export const useOnValueChangeWithNullOrder = (id, updateChart) => {
  return useCallback(
    (value) => {
      updateChart(id, { nullsOrder: value })
    },
    [id, updateChart]
  )
}

export const useOnValueChangeWithShowAbsoluteValues = (
  id,
  updateChart,
  currentValue
) => {
  return useCallback(() => {
    updateChart(id, { showAbsoluteValues: !currentValue })
  }, [id, updateChart, currentValue])
}

export const useOnValueChangeWithPercentageView = (
  id,
  dispatch,
  percentageViewEnabled
) => {
  return useCallback(() => {
    const shouldBeOn = !percentageViewEnabled
    dispatch(ChartsActions.togglePercentageView(id, shouldBeOn))
  }, [id, dispatch, percentageViewEnabled])
}

export const useOnValueChangeWithChartStyle = (id, updateChart) => {
  return useCallback(
    (value) => {
      updateChart(id, { renderArea: value === "area" })
    },
    [id, updateChart]
  )
}

export const useOnValueChangeWithFormat = (id, dispatch) => {
  return useCallback(
    (measureIndex, format) => {
      dispatch(Line2Actions.changeMeasureFormat(id, measureIndex, format))

      dispatch(ChartsActions.changeMeasureFormat(id))
    },
    [id, dispatch]
  )
}

export const useOnMeasureValueChangeWithFormat = (id, dispatch) => {
  return useCallback(
    (format, measureIndex, formatType) => {
      dispatch(
        Line2Actions.changeMeasureFormat(id, measureIndex, format, formatType)
      )
      dispatch(ChartsActions.changeMeasureFormat(id))
    },
    [id, dispatch]
  )
}

export const useOnDimensionValueChangeWithFormat = (id, dispatch) => {
  return useCallback(
    (format, dimensionIndex) => {
      dispatch(Line2Actions.changeDimensionFormat(id, format, dimensionIndex))
      dispatch(ChartsActions.changeDimensionFormat(id))
    },
    [id, dispatch]
  )
}

export const useOnValueChangeWithDateFormat = (id, dispatch) => {
  return useCallback(
    (format, dimensionIndex) => {
      dispatch(Line2Actions.changeDimensionFormat(id, format, dimensionIndex))
      dispatch(ChartsActions.changeDimensionFormat(id))
    },
    [id, dispatch]
  )
}

export const useOnValueChangeWithRangeChart = (
  id,
  dispatch,
  rangeChartEnabled
) => {
  return useCallback(() => {
    const currentValue = rangeChartEnabled
    const newValue = typeof currentValue === "undefined" ? true : !currentValue
    if (newValue) {
      dispatch(LineChartActions.toggleRangeChartOn(id))
    } else {
      dispatch(LineChartActions.toggleRangeChartOff(id))
    }
  }, [id, dispatch, rangeChartEnabled])
}
