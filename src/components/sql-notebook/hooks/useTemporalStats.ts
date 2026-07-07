// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ColumnMetadata } from "constants/prop-types"
import { useEffect, useRef, useState } from "react"
import Services from "services/immerse"
import { Stat } from "../data-preview/utils"

type TemporalStats = Array<Stat>
type StatQueryResults = [
  {
    min: number
    max: number
  }
]

export const useTemporalStats = (
  columnMetadata: ColumnMetadata
): [TemporalStats, boolean, string | null] => {
  const dbConRef = useRef()
  const query = `
    SELECT 
      MIN(${columnMetadata.value}) AS 'min', 
      MAX(${columnMetadata.value}) AS 'max' 
    FROM ${columnMetadata.table}
  `
  const [stats, setStats] = useState<TemporalStats>([])
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
        const { min, max } = results[0]
        setStats([
          {
            label: "Earliest",
            value: min
          },
          {
            label: "Latest",
            value: max
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
