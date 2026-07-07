// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as mapConstants from "vega/constants/raster-action-types"
import { makePointmapVegaSpec } from "vega/charts/raster/raster-vega-building"

import { VegaPointmapQuerySpec } from "vega/charts/types"
import { VegaMapSize, VegaMapBounds } from "vega/charts/raster/types"

import { createQueuedConnector } from "services/ConnectorWithQueue"

export const requestRasterData = (id) => ({
  type: mapConstants.REQUEST_RASTER_DATA,
  id
})

export const receiveRasterData = (id, data) => ({
  type: mapConstants.RECEIVE_RASTER_DATA,
  id,
  data
})

export const fetchRasterData = (
  chartId: string,
  querySpec: VegaPointmapQuerySpec,
  size: VegaMapSize,
  bounds: VegaMapBounds
) => async (dispatch, _getState, services) => {
  const queuedConnector = createQueuedConnector({
    connector: services.get("DbCon"),
    dashboardId: getState().dashboard.id,
    chartId,
    table: querySpec.table
  })

  dispatch(requestRasterData(chartId))

  const vegaSpec = makePointmapVegaSpec(querySpec, size, bounds)

  const result = await queuedConnector.renderVegaAsync(
    chartId,
    JSON.stringify(vegaSpec),
    { returnTiming: true }
  )
  const blobUrl = `data:image/png;base64,${result.image}`

  dispatch(receiveRasterData(chartId, blobUrl))
}
