// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { WebMercatorViewport } from "@deck.gl/core"

import Services from "services/immerse"
import {
  buildDeckgl3dQuery,
  buildDeckglCardinalityQuery
} from "../charts/deckgl/query-building"
import { setCrossFilter } from "vega/actions/filter-action-creators"
import {
  boundingBoxFilter,
  boundingBoxGeoFilter,
  BoundingBoxFilter
} from "vega/constants/filter-types"
import { DeckGLLayerQuerySpec } from "vega/charts/deckgl/query-spec"
import type DataEventTarget from "vega/charts/deckgl/data-event-target"

import { createQueuedConnector } from "services/ConnectorWithQueue"
import { tableToJson } from "utils/arrow"

export const fetch3dData = (
  dashboardId: string,
  chartId: string,
  querySpecs: Array<DeckGLLayerQuerySpec | null>,
  changedSpecs: boolean[],
  dataNotifier: DataEventTarget,
  abortSignal: AbortSignal
) => {
  const connectors: Record<
    string,
    ReturnType<typeof createQueuedConnector>
  > = {}

  // promises return true if the associated queryspec finished querying
  return querySpecs.map(async (layerSpec, layerIndex) => {
    if (!changedSpecs[layerIndex]) {
      return false
    } else if (layerSpec === null) {
      dataNotifier.nodata(layerIndex)
      return true
    } else if (abortSignal.aborted) {
      return false
    }

    let connector = connectors[layerSpec.table]
    if (!connector) {
      connector = createQueuedConnector({
        connector: Services.get("DbCon"),
        chartId,
        dashboardId,
        tableName: layerSpec.table
      })
      connectors[layerSpec.table] = connector
    }

    dataNotifier.loading(layerIndex)
    try {
      const cardinalityQuery = buildDeckglCardinalityQuery(layerSpec)
      const [{ val: cardinality }] = await connector.queryAsync(
        cardinalityQuery,
        {},
        "cardinality"
      )

      if (abortSignal.aborted) {
        return false
      } else if (cardinality === 0) {
        dataNotifier.nodata(layerIndex)
        return true
      }

      // arrow doesn't support geo columns at the moment
      const query = buildDeckgl3dQuery(layerSpec, cardinality)
      const data = await (layerSpec.type === "pointmap"
        ? connector.queryDFAsync(query).then(tableToJson)
        : connector.queryAsync(query))
      if (abortSignal.aborted) {
        return false
      }
      dataNotifier.data(layerIndex, data, layerSpec.type)
    } catch (error) {
      // Why aren't we returning false here? Well, it failed successfully! The
      // return value doesn't indicate whether or not the _query_ was
      // successful, just whether or not this function reached the end.
      if (!abortSignal.aborted) {
        dataNotifier.error(layerIndex, String(error))
      }
    }
    return true
  })
}

export const updateViewState = (
  tabId: string,
  chartId: string,
  querySpecs: Array<DeckGLLayerQuerySpec | null>,
  viewState
) => async (dispatch) => {
  const viewport = new WebMercatorViewport(viewState)
  const bounds = viewport.getBounds()
  const [, latMin, , latMax] = bounds
  let [lonMin, , lonMax] = bounds
  if (lonMin < -180 || lonMax > 180) {
    // unproject may return longitudes between -360 and 360. This happens if
    // the user is zoomed out and pans left of -180 or right of 180. We could,
    // theoretically, create two filters to represent this (ie, if the map is
    // left of -180, one filter would be for the data between -180 and lonMax,
    // and the other would be for the data between lonMin and -180, adjusted
    // by adding 360). But, let's not make this complicated...
    lonMin = -180
    lonMax = 180
  }

  const setFilters = new Set<string>()
  await Promise.all(
    querySpecs.map((layerSpec, layerIndex) => {
      if (layerSpec === null) {
        return Promise.resolve()
      }

      // prevent duplicate filters if the chart has multiple layers with the
      // same datasource + lat/lon/geo
      let filter: BoundingBoxFilter | null = null
      if (layerSpec.type === "pointmap") {
        const latKey = `${layerSpec.table}:${layerSpec.latMeasure.value}`
        const lonKey = `${layerSpec.table}:${layerSpec.lonMeasure.value}`
        if (setFilters.has(latKey) && setFilters.has(lonKey)) {
          return Promise.resolve()
        }
        setFilters.add(latKey)
        setFilters.add(lonKey)

        filter = boundingBoxFilter(
          layerSpec.latMeasure.table,
          layerSpec.table,
          layerSpec.latMeasure.value,
          layerSpec.lonMeasure.value,
          layerSpec.latMeasure.type,
          layerSpec.lonMeasure.type,
          latMin,
          latMax,
          lonMin,
          lonMax
        )
      } else {
        const geoKey = `${layerSpec.table}:${layerSpec.geoMeasure.value}`
        if (setFilters.has(geoKey)) {
          return Promise.resolve()
        }
        setFilters.add(geoKey)

        filter = boundingBoxGeoFilter(
          layerSpec.geoMeasure.table,
          layerSpec.table,
          layerSpec.geoMeasure.value,
          layerSpec.geoMeasure.type,
          latMin,
          latMax,
          lonMin,
          lonMax
        )
      }

      if (filter) {
        return dispatch(
          setCrossFilter(
            filter,
            chartId,
            undefined,
            `${tabId}:${chartId}:${layerIndex}-bbox`
          )
        )
      }
      return Promise.resolve()
    })
  )
}
