// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isEmpty } from "lodash"

import { getDataSource } from "reducers/charts/helpers/multi-source-helpers"
import { addSelector, updateSelector } from "actions/charts-action-creators"
import { setAppError } from "actions/app-action-creators"
import * as ActionTypes from "constants/action-types"
import { mergeR } from "utils/ramda-helpers"
import {
  getCustomColumnMetadata,
  getCustomColumnMetadataGeoJoin,
  getCustomColumnMetadataJoinDataSource,
  setSelectorError
} from "actions/selector-action-creators"
import { ADD_RASTER_CHART_POST_FILTER } from "charts/raster-chart/raster-chart-actions"
import { addParameterDefinition } from "components/parameters/actions"
import { ParameterTypes } from "components/parameters/parameters-types"
import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import { createGlobalExpressionAsync } from "utils/global-expressions"
import { varExtractRegex } from "components/parameters/validation"
import {
  buildGlobalExpressionParameterName,
  GlobalExpressionType
} from "components/data-manager/utils/global-custom-sql"
import { CHART_TYPES } from "constants/chart-types"

export function customDimension(
  chartId,
  chartType,
  index,
  customSelector,
  multiSourceIndex,
  isShared,
  isGlobal
) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const dataSource = getDataSource(chart, multiSourceIndex)
    const selector = { ...customSelector }
    return getCustomColumnMetadata(customSelector.value, dataSource, getState())
      .then((col) => {
        selector.type = col.type

        if (isShared) {
          const paramId = `CUSTOM_DIMENSION_${dataSource.replace(
            varExtractRegex,
            "$1"
          )}_${customSelector.label}`
          const selectorValue = `$\{${paramId}}`

          selector.value = selectorValue
          selector.label = selectorValue
          selector.sharedCustom = true

          dispatch(
            addParameterDefinition({
              name: paramId,
              displayName: customSelector.label,
              type: ParameterTypes.CUSTOM_DIMENSION,
              defaultValue: customSelector.value,
              source: dataSource,
              defaultColumnMetadata: col
            })
          )

          return dispatch(
            simpleSetParameterValue(paramId, customSelector.value)
          )
        }

        if (isGlobal) {
          return createGlobalExpressionAsync({
            name: customSelector.label,
            value: customSelector.value,
            dataSourceType: "TABLE",
            dataSourceName: dataSource,
            selectorType: GlobalExpressionType.DIMENSION
          }).then((globalExpressionId) => {
            const paramId = buildGlobalExpressionParameterName({
              dataSource,
              label: customSelector.label,
              globalExpressionType: GlobalExpressionType.DIMENSION
            })
            const selectorValue = `$\{${paramId}}`

            selector.value = selectorValue
            selector.label = selectorValue
            selector.globalCustom = true

            dispatch(
              addParameterDefinition({
                name: paramId,
                displayName: customSelector.label,
                type: ParameterTypes.GLOBAL_DIMENSION,
                defaultValue: customSelector.value,
                source: dataSource,
                defaultColumnMetadata: col,
                globalExpressionId
              })
            )

            return dispatch(
              simpleSetParameterValue(paramId, customSelector.value)
            )
          })
        }

        return Promise.resolve()
      })
      .then(() =>
        dispatch(
          addSelector("dimensions")(
            chartId,
            chartType,
            index,
            selector,
            multiSourceIndex
          )
        )
      )
      .catch((error) => {
        dispatch(setAppError(ActionTypes.CHART_RENDER_ERROR, error))
        dispatch({
          type: ActionTypes.ADD_DIMENSION,
          index,
          chartId,
          dimension: {
            ...customSelector,
            isError: true,
            isBinned: false
          },
          multiSourceIndex
        })
        dispatch(
          updateSelector(
            chartId,
            "dimensions",
            index,
            mergeR({ loading: false })
          )
        )
        dispatch(setSelectorError(chartId, { index, type: "dimensions" }))
      })
  }
}

export function customMeasure(
  chartId,
  chartType,
  index,
  customSelector,
  multiSourceIndex,
  isShared,
  isGlobal
) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const dataSource = getDataSource(chart, multiSourceIndex)

    let promise = Promise.resolve()
    const isGeoJoinable = [
      CHART_TYPES.BACKEND_CHOROPLETH,
      CHART_TYPES.LINEMAP
    ].includes(chart.type)
    if (isGeoJoinable && !isEmpty(chart.geoJoin)) {
      // Old style geo join
      promise = getCustomColumnMetadataGeoJoin(
        customSelector.value,
        dataSource,
        chart.dimensions[0],
        chart.geoJoin,
        chart.type,
        getState()
      )
    } else if (isGeoJoinable && chart.measures[0].is_join) {
      // No-code join datasource, this is mutually exclusive with old style geo joins
      promise = getCustomColumnMetadataJoinDataSource(
        customSelector.value,
        dataSource,
        getState()
      )
    } else {
      promise = getCustomColumnMetadata(
        customSelector.value,
        dataSource,
        getState()
      )
    }

    const selector = { ...customSelector }
    return promise
      .then((col) => {
        selector.type = col.type

        if (isShared) {
          const paramId = `CUSTOM_MEASURE_${dataSource.replace(
            varExtractRegex,
            "$1"
          )}_${customSelector.label}`
          const selectorValue = `$\{${paramId}}`

          selector.value = selectorValue
          selector.label = selectorValue
          selector.sharedCustom = true

          dispatch(
            addParameterDefinition({
              name: paramId,
              displayName: customSelector.label,
              type: ParameterTypes.CUSTOM_MEASURE,
              defaultValue: customSelector.value,
              source: dataSource,
              defaultColumnMetadata: col
            })
          )

          return dispatch(
            simpleSetParameterValue(paramId, customSelector.value)
          )
        }

        if (isGlobal) {
          return createGlobalExpressionAsync({
            name: customSelector.label,
            value: customSelector.value,
            dataSourceType: "TABLE",
            dataSourceName: dataSource,
            selectorType: GlobalExpressionType.MEASURE
          }).then((globalExpressionId) => {
            const paramId = buildGlobalExpressionParameterName({
              dataSource,
              label: customSelector.label,
              globalExpressionType: GlobalExpressionType.MEASURE
            })
            const selectorValue = `$\{${paramId}}`

            selector.value = selectorValue
            selector.label = selectorValue
            selector.globalCustom = true

            dispatch(
              addParameterDefinition({
                name: paramId,
                displayName: customSelector.label,
                type: ParameterTypes.GLOBAL_MEASURE,
                defaultValue: customSelector.value,
                source: dataSource,
                defaultColumnMetadata: col,
                globalExpressionId
              })
            )

            return dispatch(
              simpleSetParameterValue(paramId, customSelector.value)
            )
          })
        }

        return Promise.resolve()
      })
      .then(() =>
        dispatch(
          addSelector("measures")(
            chartId,
            chartType,
            index,
            selector,
            multiSourceIndex
          )
        )
      )
      .catch((error) => {
        dispatch(setAppError(ActionTypes.CHART_RENDER_ERROR, error))
        dispatch({
          type: ActionTypes.ADD_MEASURE,
          index,
          chartId,
          measure: {
            ...customSelector,
            isError: true,
            isBinned: false,
            multiSourceIndex
          }
        })
        dispatch(
          updateSelector(chartId, "measures", index, mergeR({ loading: false }))
        )
        dispatch(setSelectorError(chartId, { index, type: "measures" }))
      })
  }
}

export function customPostFilter(
  chartId,
  chartType,
  index,
  customSelector,
  isShared
) {
  return (dispatch, getState) =>
    getCustomColumnMetadata(
      customSelector.value,
      getState().charts[chartId].dataSource,
      getState()
    )
      .then((col) => {
        const selector = {
          ...customSelector,
          type: col.type
        }

        if (isShared) {
          const paramId = `CUSTOM_MEASURE_${customSelector.value.replace(
            varExtractRegex,
            "$1"
          )}_${customSelector.label}`
          const selectorValue = `$\{${paramId}}`

          selector.value = selectorValue
          selector.label = selectorValue
          selector.sharedCustom = true

          dispatch(
            addParameterDefinition({
              name: paramId,
              displayName: customSelector.label,
              type: ParameterTypes.CUSTOM_MEASURE,
              defaultValue: customSelector.value,
              source: getState().charts[chartId].dataSource,
              defaultColumnMetadata: col
            })
          )

          dispatch(simpleSetParameterValue(paramId, customSelector.value))
        }

        dispatch(
          addSelector("postFilters")(chartId, chartType, index, selector)
        )
      })
      .catch((error) => {
        dispatch(setAppError(ActionTypes.CHART_RENDER_ERROR, error))
        dispatch({
          type: ADD_RASTER_CHART_POST_FILTER,
          index,
          chartId,
          postFilters: { ...customSelector, isError: true, isBinned: false }
        })
        dispatch(
          updateSelector(
            chartId,
            "postFilters",
            index,
            mergeR({ loading: false })
          )
        )
        dispatch(setSelectorError(chartId, { index, type: "postFilters" }))
      })
}
