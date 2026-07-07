// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import colorChart from "charts/utils/color-chart"
import { compose } from "ramda"
import composeDimensions from "charts/utils/compose-dimensions"
import composeMeasures from "charts/utils/compose-measures"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import dc from "services/dc"
import { fetchJsonPromiseSameOrigin } from "utils/fetch-json-promise"
import generalChartUpdate from "charts/utils/general-chart-update"
import mapboxgl from "services/mapbox-gl"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import * as topojson from "topojson"
import { setValueFormatter } from "actions/charts-action-creators"
import { currentBasemapValue } from "charts/raster-chart/basemap"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { getTablesForDataSource } from "components/join-manager/utils"

const NUMBER_OF_RESULTS_TO_FETCH = 50
const MIN_FOUND_PERCENTAGE = 0.3

export const initializeCount = (jsonJoinKeys) => (countMap) => {
  jsonJoinKeys.forEach((name) => {
    countMap[name] = 0
  })
  return countMap
}

export const mapJoinKeysToResults = (results, jsonJoinKeys, names) => (
  countMap
) => {
  results.forEach((geo) => {
    jsonJoinKeys.forEach((name) => {
      if (
        !Array.isArray(geo.key0) &&
        names[name][String(geo.key0).toLowerCase()]
      ) {
        countMap[name] = countMap[name] + 1
      }
    })
  })
  return countMap
}

export const findLargestGeotypeJoinCount = (countMap) => {
  let geoType = null
  let maxCount = 0
  for (const key in countMap) {
    if (countMap[key] > maxCount) {
      geoType = key
      maxCount = countMap[key]
    }
  }
  return { maxCount, geoType }
}

export const findJsonJoinKey = (chart, jsonJoinKeys, names, joinCallback) => {
  chart
    .group()
    .top(NUMBER_OF_RESULTS_TO_FETCH, undefined, undefined, (err, results) => {
      if (err) {
        joinCallback(err, null)
      }

      const largestGeoJoin = compose(
        findLargestGeotypeJoinCount,
        mapJoinKeysToResults(results, jsonJoinKeys, names),
        initializeCount(jsonJoinKeys)
      )({})

      const foundRatio = largestGeoJoin.maxCount / results.length
      const allDeselectedDefault =
        jsonJoinKeys.length > 1 ? jsonJoinKeys[1] : null
      const result =
        foundRatio > MIN_FOUND_PERCENTAGE
          ? largestGeoJoin.geoType
          : allDeselectedDefault
      joinCallback(null, result)
    })
}

// --------------------------------------------------------------- //

export const clearOverlay = (chart, callback) => {
  chart.removeGeoJson("metaData")
  if (chart.legend()) {
    chart.legend().removeLegend()
  }
  callback(null, chart)
}

// --------------------------------------------------------------- //

export const mapGeoDataToMetaDataNames = (geo) => {
  geo.metaData.features.forEach((feature) => {
    Object.keys(feature.properties).forEach((name) => {
      if (geo.metaData.names[name]) {
        geo.metaData.names[name][
          String(feature.properties[name]).toLowerCase()
        ] = true
      }
    })
  })

  return geo
}

export const maybeParseTopojson = (chartSpec, jsonFile, geoData) => (geo) => {
  if (chartSpec.geoJsonConfig[jsonFile].isTopo) {
    geo.metaData = Object.assign(
      {},
      topojson.feature(
        geoData,
        geoData.objects[chartSpec.geoJsonConfig[jsonFile].topoKey]
      )
    )
  } else {
    geo.metaData = Object.assign({}, geoData)
  }

  return geo
}

export const setUpMetaDataNames = (joinKeys) => (geo) => {
  geo.metaData.names = {}

  joinKeys.forEach((val) => {
    geo.metaData.names[val] = {}
  })

  return geo
}

export const joinGeoAndOverlay = (chart, jsonFile, chartSpec, callback) => {
  if (jsonFile) {
    fetchJsonPromiseSameOrigin(`/geojson/${jsonFile}`)
      .then((geoData) => {
        const joinKeys = chartSpec.geoJsonConfig[chartSpec.geoJson].keys

        const geo = compose(
          mapGeoDataToMetaDataNames,
          setUpMetaDataNames(joinKeys),
          maybeParseTopojson(chartSpec, jsonFile, geoData)
        )({})

        const joinCallback = (err, results) => {
          if (err) {
            return callback(err)
          } else if (results) {
            chart
              .overlayGeoJson(
                geo.metaData.features,
                "metaData",
                (d) => d.properties[results]
              )
              .fitBounds()
            return (
              callback &&
              colorChart(chart, chartSpec, () => callback(null, chart))
            )
          } else {
            return clearOverlay(chart, callback)
          }
        }
        findJsonJoinKey(chart, joinKeys, geo.metaData.names, joinCallback)
      })
      .catch((err) => {
        callback(err, null)
      })
  } else {
    clearOverlay(chart, callback)
  }
}

export function createChoroplethChart(crossFilter) {
  return (chartSpec, node, callback) => {
    try {
      const MAP_UPDATE_INTERVAL = 40

      const tables = getTablesForDataSource(chartSpec.dataSource)
      const Choropleth = dc.geoChoroplethChart(node, true, tables, mapboxgl)

      Choropleth.width(chartSpec.width)
        .height(chartSpec.height)
        .mapStyle(currentBasemapValue(chartSpec))
        .mapboxToken(process.env.MAPBOX_TOKEN)
        .mapUpdateInterval(MAP_UPDATE_INTERVAL)

      const dimensions = composeDimensions(crossFilter, chartSpec)
      const measures = composeMeasures(
        dimensions,
        chartSpec.measures,
        "choropleth",
        chartSpec
      )

      Choropleth.dimension(dimensions).group(measures)

      Choropleth.shiftToZoom(
        getFeatureFlag(available_feature_flags.UI_SHIFT_TO_ZOOM)
      )

      return Choropleth.init().then(() => {
        joinGeoAndOverlay(Choropleth, chartSpec.geoJson, chartSpec, callback)
        setValueFormatter(Choropleth, chartSpec.measures, chartSpec.type)
      })
    } catch (e) {
      return callback(e)
    }
  }
}

export const createChoroplethChartAsync = promisifyChartCreation(
  createChoroplethChart
)

const choroplethUpdateMethods = {
  geoJson(chart, updates, chartSpec, callback) {
    joinGeoAndOverlay(chart, updates.geoJson, chartSpec, callback)
  },
  basemap(chart, chartSpec) {
    chart.mapStyle(currentBasemapValue(chartSpec))
  }
}

const allUpdates = Object.assign(
  {},
  specificChartUpdates,
  choroplethUpdateMethods
)
export const updateChoroplethChart = createUpdateFunctionForChart(
  generalChartUpdate,
  allUpdates
)
