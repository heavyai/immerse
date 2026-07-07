// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  EndpointDefaultOptions,
  EndpointSelectorNames
} from "charts/raster-chart/cross-section/constants"
import { makeDefaultEndpoints } from "charts/raster-chart/cross-section/utils/make-default-endpoints"
import { getDataSourcesForChart } from "components/quick-filters/quick-filter-utils"
import { CHART_DEFS, CHART_TYPES } from "constants/chart-types"
import { SINGLE_VALUE_STR_TYPE } from "constants/data-types"
import { addSelector } from "./charts-action-creators"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import { hasMeasuresSet } from "charts/utils/has-measures-set"

export const needsLineSpecUpdate = (
  id,
  measures,
  lineSpec,
  defaultKey = EndpointDefaultOptions.NORTH
) => {
  // check if the default line selection or lat/lon values have changed
  for (const m of measures) {
    switch (m.name) {
      case EndpointSelectorNames.START_LON:
        if (defaultKey !== m.defaultKey || lineSpec[0][0] !== m.value) {
          return true
        }
        break
      case EndpointSelectorNames.START_LAT:
        if (defaultKey !== m.defaultKey || lineSpec[0][1] !== m.value) {
          return true
        }
        break
      case EndpointSelectorNames.END_LON:
        if (defaultKey !== m.defaultKey || lineSpec[1][0] !== m.value) {
          return true
        }
        break
      case EndpointSelectorNames.END_LAT:
        if (defaultKey !== m.defaultKey || lineSpec[1][1] !== m.value) {
          return true
        }
        break
      default:
        break
    }
  }
  return false
}

export const addSelectorsFromLineSpec = (
  id,
  lineSpec,
  defaultKey = EndpointDefaultOptions.NORTH,
  chartType = CHART_TYPES.CROSS_SECTION
) => (dispatch) => {
  const chartDefMeasures = CHART_DEFS[chartType].dimensionSettings().measures

  dispatch(
    addSelector("measures")(
      id,
      chartType,
      chartDefMeasures.findIndex(
        (m) => m.name === EndpointSelectorNames.START_LON
      ),
      {
        value: lineSpec[0][0],
        type: SINGLE_VALUE_STR_TYPE,
        defaultKey
      },
      undefined
    )
  )

  dispatch(
    addSelector("measures")(
      id,
      chartType,
      chartDefMeasures.findIndex(
        (m) => m.name === EndpointSelectorNames.START_LAT
      ),
      {
        value: lineSpec[0][1],
        type: SINGLE_VALUE_STR_TYPE,
        defaultKey
      },
      undefined
    )
  )

  dispatch(
    addSelector("measures")(
      id,
      chartType,
      chartDefMeasures.findIndex(
        (m) => m.name === EndpointSelectorNames.END_LON
      ),
      {
        value: lineSpec[1][0],
        type: SINGLE_VALUE_STR_TYPE,
        defaultKey
      },
      undefined
    )
  )

  dispatch(
    addSelector("measures")(
      id,
      chartType,
      chartDefMeasures.findIndex(
        (m) => m.name === EndpointSelectorNames.END_LAT
      ),
      {
        value: lineSpec[1][1],
        type: SINGLE_VALUE_STR_TYPE,
        defaultKey
      },
      undefined
    )
  )
}

export const getCrossSectionLonLatMinMax = (chartId) => async (
  dispatch,
  getState,
  services
) => {
  const charts = getState().charts
  const chart = charts[chartId]

  const crossfilter = services
    .get("crossfilter")
    .getCrossfilter(chart.dataSource, chartId)

  // Only do this if we have valid lat/lng
  if (hasMeasuresSet(chart, ["lat", "lon"])) {
    const latMeasure = chart.measures.find((m) => m.name === "lat")
    const lonMeasure = chart.measures.find((m) => m.name === "lon")
    return Promise.all([
      crossfilter.getMinMax(
        lonMeasure?.value,
        {},
        {
          ignoreFilters: false,
          ignoreChartFilters: false,
          token: "lonMinMax"
        }
      ),
      crossfilter.getMinMax(
        latMeasure?.value,
        {},
        {
          ignoreFilters: false,
          ignoreChartFilters: false,
          token: "latMinMax"
        }
      )
    ])
  } else {
    return Promise.reject("Default endpoints can't be set without a lat/lng")
  }
}

export const updateSelectorDefaults = (dataSources) => async (
  dispatch,
  getState
) => {
  const charts = getState().charts
  // Oog... if this is a single data source this comes through as a string
  const dataSourcesNormal =
    typeof dataSources === "string" ? [dataSources] : dataSources

  Object.keys(charts).forEach(async (id) => {
    const sourcesForChart = getDataSourcesForChart(charts[id])

    if (
      !isCrossSectionType(charts[id].type) ||
      !charts[id].measures.some((m) => m.defaultKey || !m?.value) ||
      !dataSourcesNormal.some((src) => sourcesForChart.has(src)) ||
      !charts[id].measures[0] ||
      !charts[id].measures[1]
    ) {
      return
    }

    try {
      const [lonMinMax, latMinMax] = await dispatch(
        getCrossSectionLonLatMinMax(id)
      )

      const defaultOption =
        charts[id]?.measures?.find(
          (m) => m.name === EndpointSelectorNames.START_LON
        ) ?? {}
      const lineSpec = makeDefaultEndpoints(
        lonMinMax,
        latMinMax,
        defaultOption.defaultKey
      )
      if (
        needsLineSpecUpdate(
          id,
          charts[id]?.measures,
          lineSpec,
          defaultOption.defaultKey
        )
      ) {
        dispatch(
          addSelectorsFromLineSpec(
            id,
            lineSpec,
            defaultOption.defaultKey,
            charts[id].type
          )
        )
      }
    } catch (e) {
      // We don't have valid lat/lng yet most likely
      // eslint-disable-next-line no-console
      console.warn(
        "Tried to set default endpoints without a valid lat/lng measure"
      )
    }
  })
}
