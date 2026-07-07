// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from "react"
import * as HeavyAIDraw from "import-shims/heavyai-draw"

import {
  Filter,
  andFilter,
  distanceFilter,
  notNullFilter,
  orFilter,
  polygonFilter,
  boundingBoxFilter
} from "vega/constants/filter-types"
import MapComponent from "./map-component"
import { VegaMapSize, VegaMapBounds } from "./types"
import * as LatLonUtils from "./utils-latlon"

interface Props {
  chartId: string
  imageData: string
  isDataLoading: boolean
  querySpec: object
  dataBounds: VegaMapBounds | null
  basemap: any
  width: number
  height: number
  layerBBOXfilters: []
  actions: {
    setCrossFilter: Function
    fetchRasterData: Function
    setDashboardFilter: Function
    clearFilterByName: Function
  }
}

function getShapeType(shape) {
  return shape.constructor ? shape.constructor.name : typeof shape
}

const RasterChartComponent: FC<Props> = ({
  chartId,
  imageData,
  querySpec,
  dataBounds,
  layerBBOXfilters,
  basemap,
  width,
  height,
  actions
}) => {
  const [size, setSize] = useState<VegaMapSize>({ width, height })
  let defaultBounds = dataBounds

  if (layerBBOXfilters.length) {
    const { lonMin, lonMax, latMin, latMax } = layerBBOXfilters[0].filter
    defaultBounds = { lonMin, lonMax, latMin, latMax }
  }

  const [bounds, setBounds] = useState<VegaMapBounds>(defaultBounds)

  function updateFilter(_shapesJSON, sortedShapes) {
    const filterName = `chart${chartId}-shapes`
    sortedShapes = sortedShapes.filter((shape) => {
      const shape_type = getShapeType(shape)
      return (
        (shape_type === "LatLonCircle" && shape.radius > 0) ||
        ((shape_type === "Poly" || shape_type === "LatLonPoly") &&
          shape.vertsRef.length > 0)
      )
    })

    if (sortedShapes.length > 0) {
      const filters: Filter[] = [
        notNullFilter(
          querySpec.table,
          querySpec.table,
          querySpec.latMeasure.label,
          querySpec.latMeasure.type
        ),
        notNullFilter(
          querySpec.table,
          querySpec.table,
          querySpec.lonMeasure.label,
          querySpec.lonMeasure.type
        )
      ]

      const shapeFilters: Filter[] = []

      for (const shape of sortedShapes) {
        const shape_type = getShapeType(shape)
        if (shape_type === "LatLonCircle") {
          const pos = shape.getWorldPosition()
          const meters = shape.radius * 1000
          LatLonUtils.conv900913To4326(pos, pos)
          shapeFilters.push(
            distanceFilter(
              querySpec.table,
              querySpec.latMeasure.label,
              querySpec.lonMeasure.label,
              querySpec.latMeasure.type,
              querySpec.lonMeasure.type,
              pos,
              meters
            )
          )
        } else if (shape_type === "Poly" || shape_type === "LatLonPoly") {
          const aabox = shape.aabox
          const xmin = LatLonUtils.conv900913To4326X(
            aabox[HeavyAIDraw.AABox2d.MINX]
          )
          const xmax = LatLonUtils.conv900913To4326X(
            aabox[HeavyAIDraw.AABox2d.MAXX]
          )
          const ymin = LatLonUtils.conv900913To4326Y(
            aabox[HeavyAIDraw.AABox2d.MINY]
          )
          const ymax = LatLonUtils.conv900913To4326Y(
            aabox[HeavyAIDraw.AABox2d.MAXY]
          )

          const verts = shape.vertsRef
          const xform = shape.globalXform
          shapeFilters.push(
            polygonFilter(
              querySpec.table,
              querySpec.latMeasure.label,
              querySpec.lonMeasure.label,
              querySpec.latMeasure.type,
              querySpec.lonMeasure.type,
              verts.map((vert) => {
                const point = [0, 0]
                HeavyAIDraw.Point2d.transformMat2d(point, vert, xform)
                LatLonUtils.conv900913To4326(point, point)
                return point
              }),
              {
                xmin,
                xmax,
                ymin,
                ymax
              }
            )
          )
        }
      }

      filters.push(orFilter(shapeFilters))

      const filter = andFilter(filters)
      actions.setDashboardFilter(filter, filterName, chartId)
    } else {
      actions.clearFilterByName(filterName)
    }
  }
  // in initial load, the chart width comes as zero, so need to update when it is corrected
  useEffect(() => {
    setSize({ width, height })
  }, [width, height])

  useEffect(() => {
    if (size && size.width && size.height && bounds && querySpec) {
      actions.fetchRasterData(chartId, querySpec, size, bounds)
    }
  }, [actions, chartId, size, bounds, querySpec])

  useEffect(() => {
    if (size && size.width && size.height && bounds && querySpec) {
      const bboxFilter = boundingBoxFilter(
        querySpec.table,
        querySpec.latMeasure.label,
        querySpec.lonMeasure.label,
        querySpec.latMeasure.type,
        querySpec.lonMeasure.type,
        bounds.latMin,
        bounds.latMax,
        bounds.lonMin,
        bounds.lonMax
      )

      actions.setCrossFilter(
        bboxFilter,
        chartId,
        undefined,
        `chart${chartId}-crossfilter-${querySpec.table}`
      )
    }
  }, [actions, bounds, chartId, querySpec, size])

  const events = {
    updateBounds: setBounds,
    updateSize: setSize,
    updateFilter
  }

  // chart container sends width = 0 for initial dashboard load, so needed this protection
  if (width && height) {
    return (
      <MapComponent
        basemapStyle={basemap}
        width={width}
        height={height}
        dataBounds={bounds}
        layerData={imageData}
        events={events}
      />
    )
  } else {
    return null
  }
}

export default RasterChartComponent
