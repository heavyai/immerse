// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Forces re-queries on charts that are using the given parameter.
import {
  getParameterDefinitions,
  getSelectedTab,
  makeGetParameterUsage,
  makeGetParameterValueObject
} from "components/parameters/selectors"
import { batch } from "react-redux"
import {
  clearChartDataError,
  clearChartHasError
} from "actions/chart-error-state-action-creators"
import {
  isPositionMeasure,
  isRasterChart,
  isRasterChartButNotGeoheat
} from "charts/raster-chart/raster-utils"
import {
  clearRasterChartFilters,
  updateColorDomainAllLayers,
  refreshRasterChartSettings
} from "charts/raster-chart/raster-chart-actions"
import { redrawChart } from "actions/dc-action-creators"
import { SERIES_ENCODING_INDEX } from "charts/line/line-chart-constants"
import {
  clearFilters as clearHistogramCrossfilters,
  setLineChartSeriesDimension
} from "charts/line/line-chart-action-creators"
import { valueContainsParameter } from "components/parameters/utils"
import { removeColorByDimension } from "actions/charts-color-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import {
  addDimension,
  getDimensionBinning
} from "actions/charts-action-creators"
import { CUSTOM_SQL_SELECTOR_TYPE } from "vega/constants/data-selection-types"
import { setDimension } from "vega/actions/data-selection-thunks"
import { ParameterTypes } from "components/parameters/parameters-types"
import { CHART_TYPES } from "constants/chart-types"

const clearNonRasterCrossfilters = ({ type, hasError }, chartId) => (
  dispatch
) => {
  if (hasError) {
    return
  }

  if (type === "line" || type === "histogram") {
    dispatch(clearHistogramCrossfilters(chartId))
  } else {
    dispatch(
      updateChart(chartId, {
        areFiltersInverse: false,
        filters: [],
        rangeFilter: []
      })
    )
  }
}

function getParameterizedDimensionBinning(
  parameter,
  chartId,
  chartType,
  index,
  dimension,
  multiSourceIndex
) {
  return async (dispatch, getState) => {
    if (
      getParameterDefinitions(getState())[parameter]?.type ===
      ParameterTypes.CUSTOM_DIMENSION
    ) {
      const { columnMetadata } = makeGetParameterValueObject(getState())(
        parameter
      )

      await dispatch(
        addDimension(
          chartId,
          chartType,
          index,
          { ...dimension, type: columnMetadata.type || dimension.type },
          multiSourceIndex
        )
      )
    } else {
      await dispatch(
        getDimensionBinning(
          chartId,
          chartType,
          index,
          dimension,
          multiSourceIndex
        )
      )
    }
  }
}

const hasRasterButNotGeoheatLayers = (chart) =>
  isRasterChartButNotGeoheat(chart.type) ||
  (chart.layers || []).some(({ type }) => isRasterChartButNotGeoheat(type))

const nonGeoheatRasterDimensionChanged = (parameterName, chart) => {
  if (!hasRasterButNotGeoheatLayers) {
    return false
  }

  const dimensionUsesParameter = (m) =>
    valueContainsParameter(m.value, parameterName)

  return (
    chart.dimensions.some(dimensionUsesParameter) ||
    chart.layers.dimensions.some(dimensionUsesParameter)
  )
}

const handleDimensionParameterValueChanges = (
  id,
  chart,
  parameterName
) => async (dispatch, getState) => {
  let hasChangedDimensions = false
  const { columnMetadata } = makeGetParameterValueObject(getState())(
    parameterName
  )
  if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)) {
    const setDimensions = []

    chart.dataSelections.forEach((layer) =>
      Object.keys(layer.dimensions || {}).forEach((dimensionName) =>
        Array.isArray(layer.dimensions[dimensionName])
          ? layer.dimensions[dimensionName].forEach((d, i) => {
              if (
                (d.column?.value &&
                  valueContainsParameter(d.column?.value, parameterName)) ||
                (d.type === CUSTOM_SQL_SELECTOR_TYPE &&
                  valueContainsParameter(d.sql, parameterName))
              ) {
                setDimensions.push(
                  dispatch(
                    setDimension(id, layer.layerId, dimensionName, i, {
                      ...d,
                      column: { ...d.column, type: columnMetadata?.type }
                    })
                  )
                )
              }
            })
          : layer.dimensions[dimensionName] &&
            valueContainsParameter(
              layer.dimensions[dimensionName].column?.value,
              parameterName
            )
      )
    )

    await Promise.all(setDimensions)
    return
  }

  await Promise.all(
    (chart.dimensions || []).map(async (d, i) => {
      if (d.value && valueContainsParameter(d.value, parameterName)) {
        const isHistogramColorDimension =
          chart.type === "histogram" && i === SERIES_ENCODING_INDEX

        if (isHistogramColorDimension) {
          // If color dimension changes, fetch new color domain
          await dispatch(setLineChartSeriesDimension(id, d))
        }

        await dispatch(
          getParameterizedDimensionBinning(
            parameterName,
            id,
            chart.type,
            i,
            d,
            d.multiSourceIndex
          )
        )

        hasChangedDimensions = true
      }
    })
  )

  if (hasChangedDimensions) {
    // If color by dimension is set and any dimension is changed, clear color by
    // dimension and associated custom values
    await dispatch(removeColorByDimension(id))

    // Non-raster charts clear crossfilters if any dimension is changed
    if (!isRasterChart(chart.type)) {
      await dispatch(clearNonRasterCrossfilters(chart, id))
    }

    if (nonGeoheatRasterDimensionChanged(parameterName, chart)) {
      // Update dimension popup column
      await dispatch(refreshRasterChartSettings(id))
    }
  }
}

const handleMeasureParameterValueChanges = (id, chart, parameterName) => async (
  dispatch
) => {
  const hasChangedPositionMeasure = (chart.measures || []).some(
    (m) =>
      m.value &&
      isPositionMeasure(m) &&
      valueContainsParameter(m.value, parameterName)
  )

  if (hasChangedPositionMeasure && isRasterChartButNotGeoheat(chart.type)) {
    await dispatch(clearRasterChartFilters(id, true))
  }
}

const clearChartErrors = (id) => (dispatch, getState) => {
  const chart = getState().charts[id]
  if (chart.dataError || chart.hasError) {
    batch(() => {
      dispatch(clearChartHasError(id))
      dispatch(clearChartDataError(id))
    })
  }
}

export const redrawChartsUsingParameter = (parameterName) => async (
  dispatch,
  getState,
  services
) => {
  const {
    charts,
    dashboard: { dataSources }
  } = getState()

  const chartIdsToRedraw = makeGetParameterUsage(getState())(
    parameterName,
    getSelectedTab(getState())
  )

  // The above misses charts that loaded with a saved error state, since usage is
  // noted on render.
  Object.keys(charts).forEach((id) => {
    if (charts[id].dataError || charts[id].hasError) {
      chartIdsToRedraw.add(id)
    }
  })

  await Promise.all(
    Array.from(chartIdsToRedraw).map(async (id) => {
      const chart = charts[id]
      if (!chart && !dataSources[id]) {
        // Parameter usages not associated with a chart are probably a mistake
        // and might result in a parameter getting stuck as "in use".
        // eslint-disable-next-line no-console
        console.warn(
          `Parameter ${parameterName} has a usage entry that is not associated with any chart`
        )
        return
      }

      await dispatch(
        handleDimensionParameterValueChanges(id, chart, parameterName)
      )
      await dispatch(
        handleMeasureParameterValueChanges(id, chart, parameterName)
      )

      const { dcFlag } = chart
      // Note that this approach doesn't work for vega combo, stacked bar, and old
      // combo charts, which detect parameter value changes on their own.
      if (dcFlag) {
        const dcChart = services.get("dc").getChart(dcFlag)
        if (dcChart) {
          // We fetch and save domain information for raster chart measures on measure
          // creation and update, not on chart redraw, so any updates to parameters don't
          // get reflected in raster chart legends. This looks for measures that
          // contain updated parameters and refetches domain information.
          await dispatch(
            updateColorDomainAllLayers(charts[id], id, parameterName)
          )

          // Explicitly expire cache to trigger reprocessing query
          await dispatch(redrawChart(dcChart, id, true))
        } else {
          // If we have a dcFlag but dcChart is null, it probably means the
          // chart is in an error state.
          // Allows recovering from error states caused by setting a bad param value.
          // A chart is prevented from rendering when an error is set on it, so we
          // can't just redraw it. Clearing errors wil re-attempt rendering.
          await dispatch(clearChartErrors(id))
        }
      } else {
        // Stacked bar and old combo don't have dcFlags but still need errors cleared
        await dispatch(clearChartErrors(id))
      }
    })
  )
}
