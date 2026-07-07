// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "../constants/action-types"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import {
  getCardinality,
  setDimensionBinning
} from "actions/selector-action-creators"
import { isMultiLayer } from "charts/raster-chart/raster-utils"
import { initialChart } from "reducers/charts/helpers/initialChart"
import { chartSwitchToOmniChart } from "components/migration/migration-utility"
import chartSwitchFromOmniChart from "components/migration/chart-migrations/chart-switch-to-old-migrator"
import { destroyChart } from "./charts-action-creators"
import { removeChartFromParameterUsage } from "components/parameters/actions"
import { CHART_TYPES } from "constants/chart-types"

const isDimensionBinnableAndUsable = (dimension) =>
  dimension.value &&
  !dimension.isError &&
  !dimension.inactive &&
  !dimension.loading &&
  dimension.isBinnable

export function updateChartType(chartId, chartType, validRasterChart) {
  return async function updateChartTypeThunk(dispatch, getState, services) {
    const prevState = getState().charts[chartId]
    dispatch(destroyChart(chartId, prevState, validRasterChart))

    if (chartType === "vega-combo") {
      // Defaults, take everything from combo previous state, otherwise
      // nuke everything except datasource like combo does
      let carryOverState = {}
      if (prevState.type === CHART_TYPES.BOX_PLOT) {
        carryOverState = prevState
      }
      // If we're switching to vega combo, nuke the chart state but copy over
      // the data selections.
      await dispatch({
        type: ActionTypes.SET_CHART_STATE,
        chartId,
        payload: {
          ...initialChart({ type: "vega-combo", ...carryOverState }),
          isNotDc: true,
          type: "vega-combo"
        }
      })
      dispatch(chartSwitchToOmniChart(prevState, chartId))
    } else if (chartType === CHART_TYPES.BOX_PLOT) {
      // Defaults, take everything from combo previous state, otherwise
      // nuke everything except datasource like combo does
      let carryOverState = {}
      if (prevState.type === CHART_TYPES.VEGA_COMBO) {
        carryOverState = prevState
      }
      await dispatch({
        type: ActionTypes.SET_CHART_STATE,
        chartId,
        payload: {
          ...initialChart({
            type: CHART_TYPES.BOX_PLOT,
            ...carryOverState
          }),
          isNotDc: true,
          type: CHART_TYPES.BOX_PLOT
        }
      })
      dispatch(chartSwitchToOmniChart(prevState, chartId))
    } else {
      if (prevState.type === "vega-combo") {
        // move vega state into old state
        const chartFilters = getState().omnifilters.filter(
          (filter) => filter.appliesTo === "CHART" && filter.chartId === chartId
        )
        await dispatch(
          chartSwitchFromOmniChart(chartId, chartType, prevState, chartFilters)
        )
        return
      }

      const previousStateDimensions = []
      const dimensionIndices = []
      prevState.dimensions.forEach((dim, index) => {
        if (isDimensionBinnableAndUsable(dim)) {
          previousStateDimensions.push(dim)
          dimensionIndices.push(index)
        }
      })

      if (
        previousStateDimensions.length === 0 ||
        (prevState.type === "line" && chartType === "line2")
      ) {
        dispatch({
          type: ActionTypes.UPDATE_CHART_TYPE,
          chartId,
          chartType
        })
        dispatch(removeChartFromParameterUsage(chartId))
      } else {
        Promise.all(
          previousStateDimensions.map((dimension, index) =>
            Promise.all([
              services
                .get("crossfilter")
                .getCrossfilter(prevState.dataSource, chartId)
                .getMinMax(dimension.value, { min: "min_val", max: "max_val" }),
              getCardinality(
                dimension.value,
                prevState.dataSource,
                undefined,
                `cardinality/binning/${index}`
              )
            ]).then(([bounds, cardinality]) => {
              dispatch(
                setDimensionBinning(
                  chartId,
                  chartType,
                  dimensionIndices[index],
                  dimension,
                  bounds,
                  cardinality
                )
              )
            })
          )
        ).then(() => {
          dispatch({
            type: ActionTypes.UPDATE_CHART_TYPE,
            chartId,
            chartType
          })
          dispatch(removeChartFromParameterUsage(chartId))
        })
      }

      const currentState = getState().charts[chartId]
      // when we try to add different type of raster layer, we need to update the existing layer object in
      // chart.layers array to support Master layer tab visibility
      if (
        isMultiLayer(prevState.type) &&
        prevState.layers &&
        prevState.layers.length > 1 &&
        typeof prevState.currentLayer === "number" &&
        prevState.currentLayer !== "master"
      ) {
        dispatch(
          RasterChartActions.saveCurrentRasterLayer(
            chartId,
            prevState.currentLayer
          )
        )
      } else if (
        isMultiLayer(prevState.type) &&
        isMultiLayer(currentState.type) &&
        prevState.layers &&
        prevState.layers.length === 1
      ) {
        // When switching between raster charts, the layers array need to get updated
        // NOTE: when switching from non raster chart to raster, the layers array is handled by layer-picker component's componentWillMount method
        dispatch(RasterChartActions.saveCurrentRasterLayer(chartId, 0))
      }
    }
  }
}
