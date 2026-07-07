// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from "react"
import { INITIAL_VIEW_STATE, LAYER_TYPE } from "../constants"
import { IVegaMap, VegaRasterMap } from "./vega-raster-map"
import { useVegaChart } from "../hooks/use-vega-chart"
import { PointMapSettings } from "../types"
import { useGeometryBounds } from "../hooks/use-geometry-bounds"

export const VegaPointMap = ({
  mapId,
  chartSettings,
  setLoading,
  showLegend = true
}: IVegaMap) => {
  const chartKey = LAYER_TYPE.POINT
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const { vegaSpec, error: vegaError, loading: vegaLoading } = useVegaChart(
    chartKey,
    chartSettings as PointMapSettings,
    viewState
  )
  const {
    dataBounds,
    error: dataBoundsError,
    loading: dataBoundsLoading
  } = useGeometryBounds(chartSettings)

  useEffect(() => {
    setLoading([dataBoundsLoading, vegaLoading].some((loading) => loading))
  }, [dataBoundsLoading, setLoading, vegaLoading])

  const popupFields = useMemo(
    () =>
      [
        chartSettings.colorField?.field,
        chartSettings.sizeField?.field,
        chartSettings.latField?.field,
        chartSettings.lonField?.field
      ].filter(Boolean),
    [chartSettings]
  )

  return (
    <VegaRasterMap
      chartKey={chartKey}
      chartSettings={chartSettings}
      setLoading={setLoading}
      popupColumns={popupFields}
      cellIndex={mapId}
      viewState={viewState}
      setViewState={setViewState}
      vegaSpec={vegaSpec}
      dataBounds={dataBounds}
      error={vegaError || dataBoundsError}
      showLegend={showLegend}
    />
  )
}
