// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { VegaPointMap } from "./vega-point-map"
import { IVegaMap } from "./vega-raster-map"
import { ChartTypes } from "components/sql-notebook/types"
import { VegaPolygonMap } from "./vega-polygon-map"
import { VegaLineMap } from "./vega-line-map"

export const VegaMap = ({ chartSettings, ...vegaMapProps }: IVegaMap) => {
  switch (chartSettings.type) {
    case ChartTypes.POLYGON_MAP:
      return <VegaPolygonMap chartSettings={chartSettings} {...vegaMapProps} />
    case ChartTypes.LINE_MAP:
      return <VegaLineMap chartSettings={chartSettings} {...vegaMapProps} />
    case ChartTypes.POINT_MAP:
    default:
      return <VegaPointMap chartSettings={chartSettings} {...vegaMapProps} />
  }
}
