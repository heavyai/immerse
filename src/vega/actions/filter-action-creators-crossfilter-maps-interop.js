// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from "lodash"

import * as HeavyAIDraw from "import-shims/heavyai-draw"
import * as LatLonUtils from "vega/charts/raster/utils-latlon"

import { formatCoordinate } from "vega/utils/filter"

import {
  FILTER_TYPE_POLYGON,
  FILTER_TYPE_ST_CONTAINS,
  FILTER_TYPE_DISTANCE,
  FILTER_TYPE_ST_DISTANCE
} from "vega/constants/filter-type-constants"

const KM_TO_M = 1000

// given a coordinate and a distance in meters, offset the coordinate by that much.
// 3rd arg is a flag - 'lat', 'lon', or 'both'
function offsetByMeters(coordinate, meters, offset = "both") {
  // offset is a flag, you can offset the lat, the lon, or both. Defaults to both.
  // thank you, stackoverflow.
  // https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters

  const [longitude, latitude] = coordinate

  const earth = 6378.137 // radius of the earth in kilometer
  const pi = Math.PI
  const m = 1 / (((2 * pi) / 360) * earth) / 1000 // 1 meter in degree

  const new_latitude = latitude + meters * m

  const new_longitude =
    longitude + (meters * m) / Math.cos(latitude * (pi / 180))

  return [
    offset !== "lat" ? new_longitude : longitude,
    offset !== "lon" ? new_latitude : latitude
  ]
}

// given a circle, figure out its bounding box.
function circleBoundingBox(coordinate, meters) {
  const upperRight = offsetByMeters(coordinate, meters)
  const lowerLeft = offsetByMeters(coordinate, -meters)
  return {
    lonMin: lowerLeft[0],
    lonMax: upperRight[0],
    latMin: lowerLeft[1],
    latMax: upperRight[1]
  }
}

export function buildRasterPolyFilters({
  lassoFilters,
  chartId,
  chart,
  getState,
  chartDimensions
}) {
  const chartFilters = []
  const filterObjs = []

  const boundingBox = {
    lonMin: Number.POSITIVE_INFINITY,
    lonMax: Number.NEGATIVE_INFINITY,
    latMin: Number.POSITIVE_INFINITY,
    latMax: Number.NEGATIVE_INFINITY,
    lassoBoxes: []
  }

  lassoFilters.forEach((f) => {
    const layerId = getFilterLayerId(chartId, f, getState)
    const layers = []
    // if we have layers, then it's a map
    if (chart.layers) {
      if (layerId === "master") {
        layers.push(...chart.layers)
      } else {
        layers.push(chart.layers[layerId])
      }
    } else {
      // otherwise, it's a scatter plot, so just add in a placeholder to fake it.
      layers.push({ type: "backendScatter" })
    }
    layers
      .filter(
        (layer) =>
          layer.type !== "choropleth" && layer.type !== "backendChoropleth"
      )
      .forEach((layer) => {
        const lasso = buildLassoFilter(f, {
          chart,
          chartDimensions,
          layer,
          layerId
        })
        if (lasso) {
          filterObjs.push(lasso)
          // construct a minimal bounding box to encompass all lassos, using their bboxes.
          boundingBox.lassoBoxes.push(lasso.boundingBox)
          boundingBox.lonMin = Math.min(
            boundingBox.lonMin,
            formatCoordinate(lasso.boundingBox.lonMin)
          )
          boundingBox.lonMax = Math.max(
            boundingBox.lonMax,
            formatCoordinate(lasso.boundingBox.lonMax)
          )
          boundingBox.latMin = Math.min(
            boundingBox.latMin,
            formatCoordinate(lasso.boundingBox.latMin)
          )
          boundingBox.latMax = Math.max(
            boundingBox.latMax,
            formatCoordinate(lasso.boundingBox.latMax)
          )
          delete lasso.boundingBox
        }
      })
    chartFilters.push({ ...f, layerId })
  })

  return { chartFilters, filterObjs, boundingBox }
}

function buildLassoFilter(f, opts) {
  if (f.type === "LatLonPoly" || f.type === "Poly") {
    return buildPolyFilter(f, opts)
  } else if (f.type === "LatLonCircle") {
    return buildLatLonCircleFilter(f, opts)
  } else {
    // this should not be possible.
    return null
  }
}

function buildLatLonCircleFilter(
  f,
  { chart, chartDimensions, layer, layerId }
) {
  const rasterDim = getRasterDimensions({ chart, chartDimensions, layer })

  if (rasterDim === undefined) {
    return undefined
  }

  const position = [
    formatCoordinate(LatLonUtils.conv900913To4326X(f.position[0])),
    formatCoordinate(LatLonUtils.conv900913To4326Y(f.position[1]))
  ]

  return {
    ...rasterDim,
    dataExpression: rasterDim.geoExpression
      ? rasterDim.geoExpression
      : undefined,
    filterType: rasterDim.geoExpression
      ? FILTER_TYPE_ST_DISTANCE
      : FILTER_TYPE_DISTANCE,
    point: position,
    originalPosition: f.position,
    radius: f.radius,
    distanceInMeters: f.radius * KM_TO_M, // radius is in km, but we calculate in m.
    distanceInKM: f.radius,
    boundingBox: circleBoundingBox(position, f.radius * KM_TO_M),
    layerId
  }
}

function buildPolyFilter(f, { chart, chartDimensions, layer, layerId }) {
  const rasterDim = getRasterDimensions({ chart, chartDimensions, layer })

  if (rasterDim === undefined) {
    return undefined
  }

  const newShape = new HeavyAIDraw.Poly(f)
  const xform = newShape.globalXform
  const shapeBoundingBox = HeavyAIDraw.AABox2d.clone(newShape.aabox)
  const boundingBox = {
    lonMin: shapeBoundingBox[HeavyAIDraw.AABox2d.MINX],
    lonMax: shapeBoundingBox[HeavyAIDraw.AABox2d.MAXX],
    latMin: shapeBoundingBox[HeavyAIDraw.AABox2d.MINY],
    latMax: shapeBoundingBox[HeavyAIDraw.AABox2d.MAXY]
  }
  if (chart.type !== "backendScatter") {
    boundingBox.lonMin = LatLonUtils.conv900913To4326X(boundingBox.lonMin)
    boundingBox.lonMax = LatLonUtils.conv900913To4326X(boundingBox.lonMax)
    boundingBox.latMin = LatLonUtils.conv900913To4326Y(boundingBox.latMin)
    boundingBox.latMax = LatLonUtils.conv900913To4326Y(boundingBox.latMax)
  }

  const points = newShape.vertsRef.map((vert) => {
    const p0 = HeavyAIDraw.Point2d.create(vert[0], vert[1])
    HeavyAIDraw.Point2d.transformMat2d(p0, p0, xform)
    // backendScatter plots don't need to do mercator conversions, everything else does.
    if (chart.type !== "backendScatter") {
      LatLonUtils.conv900913To4326(p0, p0)
    }
    return [...p0].map(formatCoordinate)
  })

  return {
    ...rasterDim,
    dataExpression: rasterDim.geoExpression
      ? rasterDim.geoExpression
      : undefined,
    filterType: rasterDim.geoExpression
      ? FILTER_TYPE_ST_CONTAINS
      : FILTER_TYPE_POLYGON,
    polygon: points,
    points,
    position: f.position,
    originalPoints: f.verts,
    layerId,
    aabox: shapeBoundingBox,
    useLonLat: chart.type !== "backendScatter",
    boundingBox
  }
}

// when switching layers on a multi layer chart, it'll
// briefly blank out the chart's filters. That clears them from omnifilters, which also clears out
// the chartFilters array, and that in turn breaks the linkage from filter -> chart layer.
//
// So here is a -second- layer of cache for all of the filters we've drawn during this session, storing
// the same mapping. That way we can restore the identical poly to the same layer when the layer switching
// restores them on the next UPDATE_CHART call.
//
// this'll all go away when those actions are updated to not wipe out the filters and/or the filters are directly
// associated with layers.
const cachedChartLassos = new Map()

function getFilterLayerId(chartId, filter, getState) {
  const chart = getState().charts[chartId]
  const chartFilters = (
    getState().omnifilters.find(
      (f) => f.chartId === chartId && f.appliesTo === "CROSSFILTER"
    ) || { chartFilters: [] }
  ).chartFilters.filter((f) => f.layerId !== undefined)

  if (!cachedChartLassos.has(chartId)) {
    cachedChartLassos.set(chartId, new Map())
  }

  const chartLassos = cachedChartLassos.get(chartId)
  for (const [cachedFilter, layerId] of chartLassos.entries()) {
    if (matchingFilters(cachedFilter, filter)) {
      return layerId
    }
  }

  const layerId = findFilterLayerId(filter, chart, chartFilters)
  chartLassos.set(filter, layerId)

  return layerId
}

function matchingFilters(f1, f2) {
  if (f1.type === "Poly" && f2.type === "Poly" && isEqual(f1.verts, f2.verts)) {
    return true
  } else if (
    f1.type === "LatLonPoly" &&
    f2.type === "LatLonPoly" &&
    isEqual(f1.verts, f2.verts)
  ) {
    return true
  } else if (
    f1.type === "LatLonCircle" &&
    f2.type === "LatLonCircle" &&
    isEqual(f1.position, f2.position) &&
    isEqual(f1.zIndex, f2.zIndex)
  ) {
    return true
  }

  return false
}

function findFilterLayerId(filter, chart, chartFilters) {
  for (const f of chartFilters) {
    if (f.type === "Poly" && isEqual(f.verts, filter.verts)) {
      return f.layerId
    } else if (f.type === "LatLonPoly" && isEqual(f.verts, filter.verts)) {
      return f.layerId
    } else if (
      f.type === "LatLonCircle" &&
      isEqual(f.position, filter.position) &&
      isEqual(f.zIndex, filter.zIndex)
    ) {
      return f.layerId
    }
  }

  return chart.currentLayer !== undefined ? chart.currentLayer : "master"
}

export function getRasterDimensions({ chart, chartDimensions, layer }) {
  const validSetMeasureCondition = (measureName) => {
    return (m) => m.name === measureName && m.value !== undefined && !m.isError
  }
  const chartGeoMeasure = chart?.measures?.find(validSetMeasureCondition("geo"))
  const chartXMeasure = chart?.measures?.find(validSetMeasureCondition("x"))
  const chartYMeasure = chart?.measures?.find(validSetMeasureCondition("y"))
  const chartLatDimension = chartDimensions?.find(
    validSetMeasureCondition("Lat")
  )
  const chartLonDimension = chartDimensions?.find(
    validSetMeasureCondition("Lon")
  )

  const layerGeoMeasure = layer?.measures?.find(validSetMeasureCondition("geo"))
  const xMeasure = layer?.measures?.find(validSetMeasureCondition("x"))
  const yMeasure = layer?.measures?.find(validSetMeasureCondition("y"))
  const latDimension = layer?.dimensions?.find(validSetMeasureCondition("Lat"))
  const lonDimension = layer?.dimensions?.find(validSetMeasureCondition("Lon"))

  const validLayer =
    layer &&
    (layerGeoMeasure ||
      (xMeasure && yMeasure) ||
      (latDimension && lonDimension)) &&
    layer.dataSource

  const floatLon = validLayer
    ? xMeasure || lonDimension || chartXMeasure || chartLonDimension
    : chartXMeasure || chartLonDimension
  const floatLat = validLayer
    ? yMeasure || latDimension || chartYMeasure || chartLatDimension
    : chartYMeasure || chartLatDimension

  const geoMeasure = validLayer
    ? layerGeoMeasure || chartGeoMeasure
    : chartGeoMeasure

  let dataSource = validLayer ? layer.dataSource : chart.dataSource

  const isGeoJoin = validLayer
    ? Boolean(geoMeasure && layer?.geoJoin?.table)
    : Boolean(geoMeasure && chart?.geoJoin?.table)

  if (isGeoJoin) {
    dataSource = layer?.geoJoin?.table ?? chart?.geoJoin?.table
  }

  const useGeoMeasure =
    layer?.measures?.find((m) => m.name === "geo") ||
    (!layer && chartGeoMeasure)

  if (useGeoMeasure) {
    if (!geoMeasure || geoMeasure.value === undefined) {
      return undefined
    }
    return {
      dataSource,
      table: geoMeasure.table,
      geoExpression: geoMeasure.value,
      isGeoJoin
    }
  } else {
    if (floatLon === undefined || floatLat === undefined) {
      return undefined
    }
    return {
      dataSource,
      table: floatLon.table,
      lonExpression: floatLon.value,
      lonDataType: floatLon.type,
      latExpression: floatLat.value,
      latDataType: floatLat.type,
      isGeoJoin
    }
  }
}
