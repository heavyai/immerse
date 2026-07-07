// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ChartDef,
  ChartFieldAssignment,
  ChartTypes
} from "components/sql-notebook/types"
import { useMemo } from "react"
import { MapSettings } from "../types"

// A minimal attempt to keep <VegaMap /> decoupled from Heavy IQ charts
// to make it more portable in the future. MapSettings is pretty much the same
// as chart settings, but always provides lat/lng as either point column or
// two numeric columns.
export const useVegaMapSettings = (chartState: ChartDef): MapSettings => {
  const vegaMapSettings = useMemo(() => {
    const fields = chartState.fields ?? []
    const { POINT, GEOM, LAT, LON, COLOR, SIZE } = ChartFieldAssignment

    let chartFields = {}
    const colorField = fields.find((f) => f.assignedTo === COLOR && f.active)

    switch (chartState.type) {
      case ChartTypes.POLYGON_MAP: {
        const polygonField = fields.find((f) => f.assignedTo === GEOM)
        chartFields = {
          colorField,
          geomField: polygonField
        }
        break
      }
      case ChartTypes.LINE_MAP: {
        const sizeField = fields.find((f) => f.assignedTo === SIZE && f.active)
        const lineField = fields.find((f) => f.assignedTo === GEOM)
        chartFields = {
          colorField,
          sizeField,
          geomField: lineField
        }
        break
      }
      // TODO: Better fallback in case we get here without any geometry or lat/lng
      case ChartTypes.POINT_MAP:
      default: {
        const pointField = fields.find((f) => f.assignedTo === POINT)
        const latField = fields.find((f) => f.assignedTo === LAT)
        const lonField = fields.find((f) => f.assignedTo === LON)
        const sizeField = fields.find((f) => f.assignedTo === SIZE && f.active)
        chartFields = {
          colorField,
          latField: latField || pointField,
          lonField: lonField || pointField,
          sizeField
        }
      }
    }

    return {
      type: chartState.type,
      query: chartState.query,
      settings: chartState.settings,
      ...chartFields
    } as MapSettings
  }, [chartState])

  return vegaMapSettings
}
