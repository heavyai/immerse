// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Point2d } from "import-shims/heavyai-draw"
import {
  addParameterDefinition,
  removeParameterDefinition
} from "components/parameters/actions"
import {
  CoordinateIndex,
  ParameterTypes,
  CoordinateParameterShape
} from "components/parameters/parameters-types"
import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import * as LatLonUtils from "vega/charts/raster/utils-latlon"
import { isGeoChart } from "./raster-utils"
import { ADD_CROSS_SECTION_LINE_SELECTION } from "charts/raster-chart/raster-chart-actions"

const convertMercatorVertToLatLon = (vert, shape) => {
  const copy = Point2d.clone(vert)
  Point2d.transformMat2d(copy, copy, shape.globalXform)
  LatLonUtils.conv900913To4326(copy, copy)

  return [...copy]
}

export const makeLineVertexParamName = (
  chartId,
  tabId,
  vertexIndex,
  coordIndex
) =>
  `CHART-${chartId}_LINE-POINT-${vertexIndex}_COORD-${coordIndex}_TAB-${tabId}`

const addOrUpdateCoordinateParameter = (
  point,
  chartId,
  tabId,
  shape,
  vertexIndex,
  coordIndex
) => (dispatch, getState) => {
  const name = makeLineVertexParamName(chartId, tabId, vertexIndex, coordIndex)
  const parameterDefinitions = getState().parameters.definitions

  if (!parameterDefinitions[name]) {
    dispatch(
      addParameterDefinition({
        name,
        type: ParameterTypes.COORDINATE,
        defaultValue: point[coordIndex].toString(),
        parentChartId: chartId,
        parentChartTabId: tabId,
        shape,
        index: vertexIndex
      })
    )
  }

  dispatch(simpleSetParameterValue(name, point[coordIndex].toString()))
}

export const updateParametersFromShape = (chartId, shape, tabId) => (
  dispatch,
  getState
) => {
  const parentChartTabId = tabId || getState().dashboard.selectedTabId

  shape.vertsRef.forEach((vert, i) => {
    const point = convertMercatorVertToLatLon(vert, shape)

    dispatch(
      addOrUpdateCoordinateParameter(
        point,
        chartId,
        parentChartTabId,
        CoordinateParameterShape.LAT_LON_POLY_LINE,
        i,
        CoordinateIndex.LON
      )
    )

    dispatch(
      addOrUpdateCoordinateParameter(
        point,
        chartId,
        parentChartTabId,
        CoordinateParameterShape.LAT_LON_POLY_LINE,
        i,
        CoordinateIndex.LAT
      )
    )
  })
}

export const removeParametersForShape = (chartId, shape, tabId) => (
  dispatch,
  getState
) => {
  const parentChartTabId = tabId || getState().dashboard.selectedTabId

  const parameterDefinitions = getState().parameters.definitions
  Object.values(parameterDefinitions)
    .filter(
      (definition) =>
        definition.parentChartId === chartId &&
        definition.shape === CoordinateParameterShape.LAT_LON_POLY_LINE &&
        definition.parentChartTabId === parentChartTabId
    )
    .forEach((definition) => {
      dispatch(removeParameterDefinition(definition.name))
    })
}

export const handleLineDraw = (chartId, shape) => (dispatch, getState) => {
  if (!isGeoChart(getState().charts[chartId]?.type)) {
    return
  }

  if (shape) {
    dispatch(updateParametersFromShape(chartId, shape))
  }
}

export const addCrossSectionLineSelection = (chartId, lineSelection) => ({
  type: ADD_CROSS_SECTION_LINE_SELECTION,
  chartId,
  lineSelection
})
