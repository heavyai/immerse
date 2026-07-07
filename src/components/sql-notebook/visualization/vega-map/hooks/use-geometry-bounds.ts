// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from "react"
import { Parser } from "node-sql-parser"
import Services from "services/immerse"
import { column, funcWithAlias, getAST, parserOptions } from "../ast-helpers"
import { cloneDeep } from "lodash"
import { ChartTypes } from "components/sql-notebook/types"
import { MapSettings } from "../types"

export const useGeometryBounds = (mapConfig: MapSettings) => {
  const [dataBounds, setDataBounds] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const getLocationBoundsQuery = useCallback(() => {
    const getPointColumns = () => {
      // Assume it's a column
      let xField = column(mapConfig.lonField?.field)
      let yField = column(mapConfig.latField?.field)

      // If it's a point, grab lat/lng with ST_X, ST_Y
      if (mapConfig.latField?.type === "point") {
        xField = funcWithAlias("ST_X", xField).expr
        yField = funcWithAlias("ST_Y", yField).expr
      }
      // Get min/max of lat/lng for bounds
      const minX = funcWithAlias("MIN", xField, "minX")
      const maxX = funcWithAlias("MAX", xField, "maxX")
      const minY = funcWithAlias("MIN", yField, "minY")
      const maxY = funcWithAlias("MAX", yField, "maxY")
      return [minX, maxX, minY, maxY]
    }

    const getGeomColumns = () => {
      const geomField = column(mapConfig.geomField.field)

      const xMinField = funcWithAlias("ST_XMIN", geomField).expr
      const xMaxField = funcWithAlias("ST_XMAX", geomField).expr
      const yMinField = funcWithAlias("ST_YMIN", geomField).expr
      const yMaxField = funcWithAlias("ST_YMAX", geomField).expr

      const minX = funcWithAlias("MIN", xMinField, "minX")
      const maxX = funcWithAlias("MAX", xMaxField, "maxX")
      const minY = funcWithAlias("MIN", yMinField, "minY")
      const maxY = funcWithAlias("MAX", yMaxField, "maxY")
      return [minX, maxX, minY, maxY]
    }

    const parser = new Parser()
    const query = mapConfig.query
    // When does this return an array vs just a single AST?
    const queryAST = getAST(query)

    const boundsInnerQuery = "boundsInnerQuery"
    delete queryAST.limit
    // Use our original query as CTE
    queryAST.with = [
      {
        name: { type: "default", value: boundsInnerQuery },
        stmt: cloneDeep(queryAST)
      }
    ]

    const queryColumns =
      mapConfig.type === ChartTypes.POINT_MAP
        ? getPointColumns()
        : getGeomColumns()
    queryAST.columns = queryColumns
    queryAST.from = [
      {
        table: boundsInnerQuery
      }
    ]

    // None of this needed in the outer query
    delete queryAST.groupby
    delete queryAST.orderby
    delete queryAST.where

    return {
      query: parser.sqlify(queryAST, parserOptions)
    }
  }, [
    mapConfig.geomField?.field,
    mapConfig.latField?.field,
    mapConfig.latField?.type,
    mapConfig.lonField?.field,
    mapConfig.query,
    mapConfig.type
  ])

  useEffect(() => {
    if (mapConfig.geomField || (mapConfig.latField && mapConfig.lonField)) {
      let boundsQuery = null
      try {
        boundsQuery = getLocationBoundsQuery()
      } catch (e) {
        setError(e.message || e.error_msg || "Error parsing query")
      }
      if (boundsQuery) {
        setLoading(true)
        Services.get("DbCon")
          .queryAsync(boundsQuery.query)
          .then((boundsResp: any) => {
            setDataBounds(boundsResp[0])
            setError(undefined)
          })
          .catch((e) => {
            setError(
              e.message || e.error_msg || "Unknown error fetching data bounds"
            )
          })
          .finally(() => setLoading(false))
      }
    }
  }, [
    mapConfig.geomField,
    getLocationBoundsQuery,
    mapConfig.latField,
    mapConfig.lonField
  ])

  return { dataBounds, error, loading }
}
