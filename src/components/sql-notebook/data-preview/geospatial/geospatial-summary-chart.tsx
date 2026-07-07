// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MESSAGE_TYPES, Message } from "components/message/message"
import { ChartTypes, VegaTypeMap } from "components/sql-notebook/types"
import { VegaMap } from "components/sql-notebook/visualization/vega-map/vega-map/vega-map"
import { isLineGeo, isPointOnlyGeo, isPolyGeo } from "constants/data-types"
import { ColumnMetadata } from "constants/prop-types"
import React, { useMemo } from "react"

import "./geospatial-summary-chart.scss"

export const GeospatialSummaryChart = ({
  column
}: {
  column: ColumnMetadata
}) => {
  const vegaMapSettings = useMemo(() => {
    const query = `SELECT ${column.value} from ${column.table}`
    if (isPointOnlyGeo(column.type)) {
      return {
        type: ChartTypes.POINT_MAP,
        latField: {
          field: column.value,
          type: VegaTypeMap.POINT,
          active: true
        },
        lonField: {
          field: column.value,
          type: VegaTypeMap.POINT,
          active: true
        },
        settings: {
          dotDensity: true
        },
        query
      }
    } else if (isLineGeo(column.type)) {
      return {
        type: ChartTypes.LINE_MAP,
        geomField: {
          field: column.value,
          type: VegaTypeMap.LINE
        },
        settings: {
          dotDensity: true
        },
        query
      }
    } else if (isPolyGeo(column.type)) {
      return {
        type: ChartTypes.POLYGON_MAP,
        geomField: {
          field: column.value,
          type: VegaTypeMap.POLYGON
        },
        settings: {
          border: true
        },
        query
      }
    }

    return null
  }, [column])

  return (
    <div className="sql-notebook-data-preview__geospatial-chart">
      {vegaMapSettings ? (
        <VegaMap
          showLegend={false}
          chartSettings={vegaMapSettings}
          mapId={0}
          setLoading={() => {}}
        />
      ) : (
        <Message
          type={MESSAGE_TYPES.INFO}
          message="Unable to generate map preview"
        />
      )}
    </div>
  )
}
