// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ColumnMetadata } from "constants/prop-types"
import { useEffect, useRef, useState } from "react"
import Services from "services/immerse"

type Stat = {
  label: string
  value: number | string
  tooltip?: string
}
type GeospatialStats = Array<Stat>
type StatQueryResults = [
  {
    minLon: number
    maxLon: number
    minLat: number
    maxLat: number
  }
]

export const useGeospatialStats = (
  columnMetadata: ColumnMetadata
): [GeospatialStats, boolean, string | null] => {
  const dbConRef = useRef()
  const query = `
    SELECT
      MIN(ST_XMIN(${columnMetadata.value})) as minLon,
      MAX(ST_XMAX(${columnMetadata.value})) as maxLon,
      MIN(ST_YMIN(${columnMetadata.value})) as minLat,
      MAX(ST_YMAX(${columnMetadata.value})) as maxLat
    from
      ${columnMetadata.table}
  `
  const [stats, setStats] = useState<GeospatialStats>([])
  const [error, setError] = useState<null | string>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dbConRef.current) {
      dbConRef.current = Services.get("DbCon")
    }
    // Don't start the loading spinner at all if it's < 100ms to
    // prevent blinky behavior
    const loadingTimer = setTimeout(() => {
      setLoading(true)
    }, 100)
    setError(null)
    dbConRef.current
      ?.queryAsync(query)
      .then((results: StatQueryResults) => {
        clearTimeout(loadingTimer)
        setLoading(false)
        const { minLon, maxLon, minLat, maxLat } = results[0]
        setStats([
          {
            label: "Min Longitude",
            value: minLon,
            tooltip: "Min Longitude"
          },
          {
            label: "Max Longitude",
            value: maxLon,
            tooltip: "Max Longitude"
          },
          {
            label: "Min Latitude",
            value: minLat,
            tooltip: "Min Latitude"
          },
          {
            label: "Max Latitude",
            value: maxLat,
            tooltip: "Max Latitude"
          }
        ])
      })
      .catch((e: Error) => {
        setError(
          e?.message || e?.error_message || "Error fetching column summary"
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [query])
  return [stats, loading, error]
}
