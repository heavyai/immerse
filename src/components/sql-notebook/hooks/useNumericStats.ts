// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ColumnMetadata } from "constants/prop-types"
import { useEffect, useRef, useState } from "react"
import Services from "services/immerse"
import { Stat } from "../data-preview/statistic"

type NumericStats = Array<Stat>
type StatQueryResults = [
  {
    min: number
    max: number
    median: number
    avg: number
  }
]

export const useNumericStats = (
  columnMetadata: ColumnMetadata
): [NumericStats, boolean, string | null] => {
  const dbConRef = useRef()
  const query = `SELECT MIN(${columnMetadata.value}) AS 'min', MAX(${columnMetadata.value}) AS 'max', AVG(${columnMetadata.value}) AS 'avg', APPROX_MEDIAN(${columnMetadata.value}) AS 'median' FROM ${columnMetadata.table}`
  const [stats, setStats] = useState<NumericStats>([])
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
        const { min, max, median, avg } = results[0]
        setStats([
          {
            label: "Min Value",
            value: min,
            tooltip: "Minimum value"
          },
          {
            label: "Max Value",
            value: max,
            tooltip: "Maximum value"
          },
          {
            label: "Average",
            value: avg,
            tooltip: "Average value"
          },
          {
            label: "Median",
            value: median,
            tooltip: "Median Value"
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
